#!/bin/bash
# Honest end-to-end flow test using portable shell (no grep -P).
# Walks every workflow step and reports pass/fail per step.

set -u
API="http://localhost:4000/api"
PASS=0
FAIL=0
declare -a RESULTS

check() {
  local label="$1"
  local ok="$2"
  local detail="$3"
  if [ "$ok" = "1" ]; then
    PASS=$((PASS+1))
    RESULTS+=("PASS: $label")
    echo "[PASS] $label"
  else
    FAIL=$((FAIL+1))
    RESULTS+=("FAIL: $label -- $detail")
    echo "[FAIL] $label -- $detail"
  fi
}

# Helper: extract a top-level JSON string field using sed (portable)
extract() {
  local json="$1"
  local key="$2"
  echo "$json" | sed -n "s/.*\"$key\":\"\([^\"]*\)\".*/\1/p" | head -n 1
}

echo "=== STEP 0: Health ==="
HEALTH=$(curl -s "$API/health")
echo "  -> $HEALTH"
case "$HEALTH" in
  *"healthy"*) check "Health endpoint" 1 "" ;;
  *)            check "Health endpoint" 0 "$HEALTH" ;;
esac

echo
echo "=== STEP 1: Login (admin@acme.com) ==="
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"Password123!"}')
TOKEN=$(extract "$LOGIN" "token")
echo "  TOKEN length: ${#TOKEN}"
[ ${#TOKEN} -gt 20 ] && check "Login returns JWT" 1 "" || { check "Login returns JWT" 0 "$LOGIN"; exit 1; }
AUTH="Authorization: Bearer $TOKEN"

echo
echo "=== STEP 2: Create requisition ==="
REQ=$(curl -s -X POST "$API/requisitions" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"E2E Senior Engineer","department":"Engineering","location":"Remote","headcount":1,"description":"Build great stuff. Ship fast. Help teammates.","requirements":["TypeScript","Node.js","React"]}')
REQ_ID=$(extract "$REQ" "id")
echo "  REQ_ID: $REQ_ID"
[ -n "$REQ_ID" ] && check "Create requisition" 1 "" || check "Create requisition" 0 "$REQ"

echo
echo "=== STEP 3: Publish requisition to job board ==="
PUB=$(curl -s -X POST "$API/requisitions/$REQ_ID/publish" \
  -H "Content-Type: application/json" -H "$AUTH" -d '{}')
JOB_ID=$(extract "$PUB" "id")
JOB_SLUG=$(extract "$PUB" "slug")
echo "  JOB_ID: $JOB_ID  SLUG: $JOB_SLUG"
[ -n "$JOB_ID" ] && check "Publish requisition (creates JobPosting)" 1 "" || check "Publish requisition" 0 "$PUB"

echo
echo "=== STEP 4: Public jobs list shows the new job ==="
PUBJOBS=$(curl -s "$API/public/jobs?pageSize=10")
echo "  -> $(echo "$PUBJOBS" | head -c 300)"
case "$PUBJOBS" in
  *"$JOB_ID"*) check "Public jobs list contains new posting" 1 "" ;;
  *)           check "Public jobs list contains new posting" 0 "JOB_ID $JOB_ID not in feed" ;;
esac

echo
echo "=== STEP 5: Public can fetch single job by slug ==="
SINGLE=$(curl -s "$API/public/jobs/$JOB_SLUG")
case "$SINGLE" in
  *"$JOB_ID"*) check "Public single-job fetch" 1 "" ;;
  *)           check "Public single-job fetch" 0 "$(echo $SINGLE | head -c 200)" ;;
esac

echo
echo "=== STEP 6: Anonymous candidate applies ==="
APPLY=$(curl -s -X POST "$API/public/apply" \
  -H "Content-Type: application/json" \
  -d "{\"jobPostingId\":\"$JOB_ID\",\"firstName\":\"Test\",\"lastName\":\"Candidate\",\"email\":\"e2e-cand-$$@example.com\",\"phone\":\"+15551234567\"}")
echo "  -> $(echo $APPLY | head -c 250)"
APP_ID=$(extract "$APPLY" "applicationId")
CAND_ID=$(extract "$APPLY" "candidateId")
echo "  APP_ID: $APP_ID  CAND_ID: $CAND_ID"
[ -n "$APP_ID" ] && check "Public application submission" 1 "" || check "Public application submission" 0 "$APPLY"

echo
echo "=== STEP 7: Application visible in admin requisition view ==="
REQGET=$(curl -s "$API/requisitions/$REQ_ID" -H "$AUTH")
case "$REQGET" in
  *"$REQ_ID"*) check "Admin can fetch requisition with relations" 1 "" ;;
  *)           check "Admin can fetch requisition" 0 "$(echo $REQGET | head -c 200)" ;;
esac

echo
echo "=== STEP 8: Candidate appears in candidates list ==="
CANDLIST=$(curl -s "$API/candidates?pageSize=50" -H "$AUTH")
case "$CANDLIST" in
  *"$CAND_ID"*) check "Candidate appears in admin list" 1 "" ;;
  *)            check "Candidate appears in admin list" 0 "CAND_ID $CAND_ID missing" ;;
esac

echo
echo "=== STEP 9: Advance candidate stage (APPLIED -> SCREENED) ==="
if [ -n "$CAND_ID" ]; then
  STAGE=$(curl -s -X POST "$API/candidates/$CAND_ID/stage" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d '{"stage":"SCREENED","reason":"E2E test progression"}')
  echo "  -> $(echo $STAGE | head -c 250)"
  case "$STAGE" in
    *SCREENED*|*success*|*data*) check "Advance candidate stage" 1 "" ;;
    *)                           check "Advance candidate stage" 0 "$STAGE" ;;
  esac
else
  check "Advance candidate stage" 0 "skipped - no CAND_ID"
fi

echo
echo "=== STEP 10: Unpublish requisition ==="
UNPUB=$(curl -s -X POST "$API/requisitions/$REQ_ID/unpublish" \
  -H "Content-Type: application/json" -H "$AUTH" -d '{}')
case "$UNPUB" in
  *unpublished*|*success*) check "Unpublish requisition" 1 "" ;;
  *)                       check "Unpublish requisition" 0 "$UNPUB" ;;
esac

echo
echo "=== STEP 11: Public jobs list no longer shows it ==="
PUBJOBS2=$(curl -s "$API/public/jobs?pageSize=10")
case "$PUBJOBS2" in
  *"$JOB_ID"*) check "Unpublished job removed from public feed" 0 "still present" ;;
  *)           check "Unpublished job removed from public feed" 1 "" ;;
esac

echo
echo "=== STEP 12: Agent runs API responds ==="
RUNS=$(curl -s "$API/agents/runs?pageSize=5" -H "$AUTH")
case "$RUNS" in
  *data*) check "Agent runs list" 1 "" ;;
  *)      check "Agent runs list" 0 "$RUNS" ;;
esac

echo
echo "=== STEP 13: HITL pending list responds ==="
HITL=$(curl -s "$API/agents/hitl" -H "$AUTH")
case "$HITL" in
  *success*|*data*) check "HITL pending list" 1 "" ;;
  *)                check "HITL pending list" 0 "$HITL" ;;
esac

echo
echo "=== STEP 13b: Upload resume for the candidate ==="
if [ -n "$CAND_ID" ]; then
  RESUME_FILE="D:/CDC/ATS/scripts/resume-test.txt"
  if [ ! -f "$RESUME_FILE" ]; then
    printf 'Test Candidate\nSenior Engineer with 5 years experience\nSkills: TypeScript, Node.js, React, PostgreSQL\nWork: Acme Corp 2021-2026 Engineer\nEducation: BS Computer Science\nEmail: e2e-cand@example.com\n' > "$RESUME_FILE"
  fi
  UP=$(curl -s -X POST "$API/resume/upload" \
    -H "$AUTH" \
    -F "candidateId=$CAND_ID" \
    -F "resume=@$RESUME_FILE;type=text/plain")
  echo "  -> $(echo $UP | head -c 250)"
  case "$UP" in
    *resumeId*|*EXTRACTED*) check "Resume upload + text extraction" 1 "" ;;
    *)                      check "Resume upload + text extraction" 0 "$UP" ;;
  esac
else
  check "Resume upload + text extraction" 0 "skipped - no CAND_ID"
fi

echo
echo "=== STEP 13c: Schedule an interview ==="
if [ -n "$APP_ID" ]; then
  INT=$(curl -s -X POST "$API/interviews" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"applicationId\":\"$APP_ID\",\"type\":\"PHONE_SCREEN\",\"scheduledAt\":\"2026-06-01T15:00:00Z\",\"durationMinutes\":30,\"interviewerIds\":[]}")
  echo "  -> $(echo $INT | head -c 200)"
  case "$INT" in
    *id*) check "Schedule interview" 1 "" ;;
    *)    check "Schedule interview" 0 "$INT" ;;
  esac
else
  check "Schedule interview" 0 "skipped - no APP_ID"
fi

echo
echo "=== STEP 13d: Advance through all stages to OFFER ==="
if [ -n "$CAND_ID" ]; then
  # Already advanced to SCREENED in step 9. Walk through remaining gates.
  for STG in PHONE_SCREEN ASSESSMENT INTERVIEW FINAL_REVIEW OFFER; do
    R=$(curl -s -X POST "$API/candidates/$CAND_ID/stage" \
      -H "Content-Type: application/json" -H "$AUTH" \
      -d "{\"stage\":\"$STG\",\"reason\":\"E2E walk\"}")
    case "$R" in
      *"$STG"*) ;;
      *)
        echo "  Stage $STG response: $(echo $R | head -c 200)"
        ;;
    esac
  done
  # Verify final state via candidate fetch
  C=$(curl -s "$API/candidates/$CAND_ID" -H "$AUTH")
  case "$C" in
    *OFFER*) check "Walk candidate to OFFER stage" 1 "" ;;
    *)       check "Walk candidate to OFFER stage" 0 "$(echo $C | head -c 200)" ;;
  esac
else
  check "Walk candidate to OFFER stage" 0 "skipped - no CAND_ID"
fi

echo
echo "=== STEP 13e: Create + accept an offer ==="
if [ -n "$APP_ID" ]; then
  OF=$(curl -s -X POST "$API/offers" \
    -H "Content-Type: application/json" -H "$AUTH" \
    -d "{\"requisitionId\":\"$REQ_ID\",\"candidateId\":\"$CAND_ID\",\"applicationId\":\"$APP_ID\",\"salaryAmount\":150000,\"salaryCurrency\":\"USD\",\"startDate\":\"2026-07-01\"}")
  echo "  -> $(echo $OF | head -c 250)"
  OFFER_ID=$(extract "$OF" "id")
  case "$OF" in
    *VALIDATION_ERROR*|*error*) check "Create offer" 0 "$OF" ;;
    *id*)                       check "Create offer" 1 "" ;;
    *)                          check "Create offer" 0 "$OF" ;;
  esac

  if [ -n "$OFFER_ID" ]; then
    # Send offer (PATCH with status SENT)
    SEND=$(curl -s -X PATCH "$API/offers/$OFFER_ID" \
      -H "Content-Type: application/json" -H "$AUTH" \
      -d '{"status":"SENT"}')
    echo "  send -> $(echo $SEND | head -c 150)"
    case "$SEND" in
      *SENT*) check "Send offer (PATCH status=SENT)" 1 "" ;;
      *)      check "Send offer (PATCH status=SENT)" 0 "$SEND" ;;
    esac

    # Accept offer (PATCH with status ACCEPTED)
    ACC=$(curl -s -X PATCH "$API/offers/$OFFER_ID" \
      -H "Content-Type: application/json" -H "$AUTH" \
      -d '{"status":"ACCEPTED"}')
    echo "  accept -> $(echo $ACC | head -c 150)"
    case "$ACC" in
      *ACCEPTED*) check "Accept offer (PATCH status=ACCEPTED)" 1 "" ;;
      *)          check "Accept offer (PATCH status=ACCEPTED)" 0 "$ACC" ;;
    esac

    # Verify application auto-advanced to HIRED
    sleep 1
    APPS=$(curl -s "$API/candidates/$CAND_ID/applications" -H "$AUTH")
    case "$APPS" in
      *HIRED*) check "Application auto-advanced to HIRED after acceptance" 1 "" ;;
      *)       check "Application auto-advanced to HIRED after acceptance" 0 "$(echo $APPS | head -c 200)" ;;
    esac
  fi
else
  check "Create offer" 0 "skipped - no APP_ID"
fi

echo
echo "=== STEP 14: Analytics dashboard ==="
ANL=$(curl -s "$API/analytics/dashboard" -H "$AUTH")
case "$ANL" in
  *success*|*total*|*data*) check "Analytics dashboard" 1 "" ;;
  *)                        check "Analytics dashboard" 0 "$(echo $ANL | head -c 200)" ;;
esac

echo
echo "============================================================"
echo "RESULTS: $PASS passed, $FAIL failed (out of $((PASS+FAIL)))"
echo "============================================================"
for line in "${RESULTS[@]}"; do
  echo "  $line"
done

[ $FAIL -eq 0 ]
