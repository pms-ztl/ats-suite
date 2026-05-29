/**
 * Phase 37a — Skill taxonomy for canonicalization.
 *
 * Curated list of ~300 commonly-extracted skills with aliases. When the
 * LLM extracts a skill, we look it up here first; matches get a canonical
 * id + label. Unknowns get a separate "LLM canonicalization" pass that
 * proposes a canonical form (recorded as `canonical: null` if rejected).
 *
 * Coverage targets:
 *   - Software: most popular langs, frameworks, databases, cloud, infra
 *   - Business: PM, ops, design, marketing, sales, finance, hr, legal
 *   - Domain: data, ml, security, devops, mobile, embedded
 *
 * This is NOT a full taxonomy (ESCO has 30k+). For unknowns we fall back
 * to LLM canonicalization. The 300 we DO cover represent ~80% of real-
 * resume skill mentions.
 *
 * Entry shape:
 *   id      — stable canonical id; never change after release
 *   label   — display form
 *   aliases — lowercase strings the LLM/user might write
 *   category — coarse bucket for filtering/faceted search
 */

export type SkillCategory =
  | "language"          // programming languages
  | "framework"         // web/mobile/UI frameworks
  | "library"           // significant libraries (Pandas, etc.)
  | "database"
  | "cloud"
  | "devops"
  | "data"              // data engineering / ML / analytics
  | "design"
  | "product"
  | "ops"
  | "marketing"
  | "sales"
  | "finance"
  | "hr"
  | "legal"
  | "soft"              // communication, leadership, etc.
  | "domain"            // industry knowledge
  | "tool";             // specific tools

export interface CanonicalSkill {
  id: string;
  label: string;
  aliases: string[];
  category: SkillCategory;
}

// Curated. Order doesn't matter — lookup is by alias.
// Aliases ARE lowercase. Original-case label is what we display.
export const SKILL_TAXONOMY: CanonicalSkill[] = [
  // ── Programming languages
  { id: "skill:python", label: "Python", aliases: ["python", "py", "python3", "python 3"], category: "language" },
  { id: "skill:javascript", label: "JavaScript", aliases: ["javascript", "js", "ecmascript", "es6", "es2015"], category: "language" },
  { id: "skill:typescript", label: "TypeScript", aliases: ["typescript", "ts"], category: "language" },
  { id: "skill:java", label: "Java", aliases: ["java", "jdk", "jvm"], category: "language" },
  { id: "skill:kotlin", label: "Kotlin", aliases: ["kotlin"], category: "language" },
  { id: "skill:swift", label: "Swift", aliases: ["swift", "swiftui"], category: "language" },
  { id: "skill:objc", label: "Objective-C", aliases: ["objective-c", "objc", "obj-c"], category: "language" },
  { id: "skill:c", label: "C", aliases: ["c"], category: "language" },
  { id: "skill:cpp", label: "C++", aliases: ["c++", "cpp", "c plus plus"], category: "language" },
  { id: "skill:csharp", label: "C#", aliases: ["c#", "csharp", "c sharp", ".net"], category: "language" },
  { id: "skill:go", label: "Go", aliases: ["go", "golang"], category: "language" },
  { id: "skill:rust", label: "Rust", aliases: ["rust", "rustlang"], category: "language" },
  { id: "skill:ruby", label: "Ruby", aliases: ["ruby"], category: "language" },
  { id: "skill:php", label: "PHP", aliases: ["php"], category: "language" },
  { id: "skill:perl", label: "Perl", aliases: ["perl"], category: "language" },
  { id: "skill:scala", label: "Scala", aliases: ["scala"], category: "language" },
  { id: "skill:elixir", label: "Elixir", aliases: ["elixir"], category: "language" },
  { id: "skill:erlang", label: "Erlang", aliases: ["erlang"], category: "language" },
  { id: "skill:haskell", label: "Haskell", aliases: ["haskell"], category: "language" },
  { id: "skill:clojure", label: "Clojure", aliases: ["clojure"], category: "language" },
  { id: "skill:r", label: "R", aliases: ["r"], category: "language" },
  { id: "skill:matlab", label: "MATLAB", aliases: ["matlab"], category: "language" },
  { id: "skill:bash", label: "Bash", aliases: ["bash", "shell", "shell scripting"], category: "language" },
  { id: "skill:sql", label: "SQL", aliases: ["sql"], category: "language" },
  { id: "skill:html", label: "HTML", aliases: ["html", "html5"], category: "language" },
  { id: "skill:css", label: "CSS", aliases: ["css", "css3"], category: "language" },
  { id: "skill:dart", label: "Dart", aliases: ["dart"], category: "language" },
  { id: "skill:lua", label: "Lua", aliases: ["lua"], category: "language" },

  // ── Web/UI frameworks
  { id: "skill:react", label: "React", aliases: ["react", "react.js", "reactjs"], category: "framework" },
  { id: "skill:nextjs", label: "Next.js", aliases: ["next.js", "nextjs", "next"], category: "framework" },
  { id: "skill:vue", label: "Vue", aliases: ["vue", "vue.js", "vuejs", "vue3"], category: "framework" },
  { id: "skill:angular", label: "Angular", aliases: ["angular", "angular.js", "angularjs"], category: "framework" },
  { id: "skill:svelte", label: "Svelte", aliases: ["svelte", "sveltekit"], category: "framework" },
  { id: "skill:nodejs", label: "Node.js", aliases: ["node", "node.js", "nodejs"], category: "framework" },
  { id: "skill:express", label: "Express", aliases: ["express", "express.js", "expressjs"], category: "framework" },
  { id: "skill:nestjs", label: "NestJS", aliases: ["nest", "nestjs", "nest.js"], category: "framework" },
  { id: "skill:django", label: "Django", aliases: ["django"], category: "framework" },
  { id: "skill:flask", label: "Flask", aliases: ["flask"], category: "framework" },
  { id: "skill:fastapi", label: "FastAPI", aliases: ["fastapi"], category: "framework" },
  { id: "skill:rails", label: "Ruby on Rails", aliases: ["rails", "ruby on rails", "ror"], category: "framework" },
  { id: "skill:spring", label: "Spring", aliases: ["spring", "spring boot", "springboot"], category: "framework" },
  { id: "skill:dotnet", label: ".NET", aliases: [".net", "dotnet", "asp.net", "aspnet"], category: "framework" },
  { id: "skill:laravel", label: "Laravel", aliases: ["laravel"], category: "framework" },
  { id: "skill:tailwind", label: "Tailwind CSS", aliases: ["tailwind", "tailwindcss", "tailwind css"], category: "framework" },
  { id: "skill:flutter", label: "Flutter", aliases: ["flutter"], category: "framework" },
  { id: "skill:reactnative", label: "React Native", aliases: ["react native", "reactnative"], category: "framework" },
  { id: "skill:graphql", label: "GraphQL", aliases: ["graphql"], category: "framework" },
  { id: "skill:rest", label: "REST APIs", aliases: ["rest", "rest api", "rest apis", "restful"], category: "framework" },
  { id: "skill:grpc", label: "gRPC", aliases: ["grpc"], category: "framework" },

  // ── Data / ML
  { id: "skill:pandas", label: "Pandas", aliases: ["pandas"], category: "library" },
  { id: "skill:numpy", label: "NumPy", aliases: ["numpy"], category: "library" },
  { id: "skill:scikit", label: "scikit-learn", aliases: ["scikit-learn", "sklearn", "scikit learn"], category: "library" },
  { id: "skill:pytorch", label: "PyTorch", aliases: ["pytorch", "torch"], category: "library" },
  { id: "skill:tensorflow", label: "TensorFlow", aliases: ["tensorflow", "tf"], category: "library" },
  { id: "skill:keras", label: "Keras", aliases: ["keras"], category: "library" },
  { id: "skill:xgboost", label: "XGBoost", aliases: ["xgboost", "xgb"], category: "library" },
  { id: "skill:huggingface", label: "Hugging Face", aliases: ["hugging face", "huggingface", "transformers"], category: "library" },
  { id: "skill:langchain", label: "LangChain", aliases: ["langchain"], category: "library" },
  { id: "skill:llamaindex", label: "LlamaIndex", aliases: ["llamaindex", "llama index"], category: "library" },
  { id: "skill:spark", label: "Apache Spark", aliases: ["spark", "apache spark", "pyspark"], category: "data" },
  { id: "skill:hadoop", label: "Hadoop", aliases: ["hadoop"], category: "data" },
  { id: "skill:airflow", label: "Apache Airflow", aliases: ["airflow", "apache airflow"], category: "data" },
  { id: "skill:dbt", label: "dbt", aliases: ["dbt", "data build tool"], category: "data" },
  { id: "skill:snowflake", label: "Snowflake", aliases: ["snowflake"], category: "data" },
  { id: "skill:databricks", label: "Databricks", aliases: ["databricks"], category: "data" },
  { id: "skill:bigquery", label: "BigQuery", aliases: ["bigquery", "big query"], category: "data" },
  { id: "skill:redshift", label: "Redshift", aliases: ["redshift"], category: "data" },
  { id: "skill:tableau", label: "Tableau", aliases: ["tableau"], category: "data" },
  { id: "skill:powerbi", label: "Power BI", aliases: ["power bi", "powerbi"], category: "data" },
  { id: "skill:looker", label: "Looker", aliases: ["looker"], category: "data" },
  { id: "skill:dl", label: "Deep Learning", aliases: ["deep learning", "dl"], category: "data" },
  { id: "skill:nlp", label: "NLP", aliases: ["nlp", "natural language processing"], category: "data" },
  { id: "skill:cv", label: "Computer Vision", aliases: ["computer vision", "cv"], category: "data" },
  { id: "skill:rag", label: "RAG", aliases: ["rag", "retrieval augmented generation", "retrieval-augmented generation"], category: "data" },
  { id: "skill:llm", label: "LLMs", aliases: ["llm", "llms", "large language model", "large language models"], category: "data" },
  { id: "skill:ml", label: "Machine Learning", aliases: ["machine learning", "ml"], category: "data" },
  { id: "skill:mlops", label: "MLOps", aliases: ["mlops", "ml ops"], category: "data" },

  // ── Databases
  { id: "skill:postgres", label: "PostgreSQL", aliases: ["postgres", "postgresql", "psql"], category: "database" },
  { id: "skill:mysql", label: "MySQL", aliases: ["mysql"], category: "database" },
  { id: "skill:sqlite", label: "SQLite", aliases: ["sqlite", "sqlite3"], category: "database" },
  { id: "skill:mssql", label: "SQL Server", aliases: ["sql server", "mssql", "microsoft sql server"], category: "database" },
  { id: "skill:oracle", label: "Oracle DB", aliases: ["oracle", "oracle db", "oracle database"], category: "database" },
  { id: "skill:mongodb", label: "MongoDB", aliases: ["mongo", "mongodb"], category: "database" },
  { id: "skill:redis", label: "Redis", aliases: ["redis"], category: "database" },
  { id: "skill:elasticsearch", label: "Elasticsearch", aliases: ["elasticsearch", "elastic search", "es"], category: "database" },
  { id: "skill:dynamodb", label: "DynamoDB", aliases: ["dynamodb", "dynamo db"], category: "database" },
  { id: "skill:cassandra", label: "Cassandra", aliases: ["cassandra"], category: "database" },
  { id: "skill:cockroachdb", label: "CockroachDB", aliases: ["cockroachdb", "cockroach"], category: "database" },
  { id: "skill:neo4j", label: "Neo4j", aliases: ["neo4j"], category: "database" },
  { id: "skill:pinecone", label: "Pinecone", aliases: ["pinecone"], category: "database" },
  { id: "skill:weaviate", label: "Weaviate", aliases: ["weaviate"], category: "database" },
  { id: "skill:pgvector", label: "pgvector", aliases: ["pgvector"], category: "database" },

  // ── Cloud / Infra
  { id: "skill:aws", label: "AWS", aliases: ["aws", "amazon web services"], category: "cloud" },
  { id: "skill:gcp", label: "GCP", aliases: ["gcp", "google cloud", "google cloud platform"], category: "cloud" },
  { id: "skill:azure", label: "Azure", aliases: ["azure", "microsoft azure"], category: "cloud" },
  { id: "skill:cloudflare", label: "Cloudflare", aliases: ["cloudflare"], category: "cloud" },
  { id: "skill:k8s", label: "Kubernetes", aliases: ["kubernetes", "k8s"], category: "devops" },
  { id: "skill:docker", label: "Docker", aliases: ["docker"], category: "devops" },
  { id: "skill:terraform", label: "Terraform", aliases: ["terraform"], category: "devops" },
  { id: "skill:ansible", label: "Ansible", aliases: ["ansible"], category: "devops" },
  { id: "skill:helm", label: "Helm", aliases: ["helm"], category: "devops" },
  { id: "skill:istio", label: "Istio", aliases: ["istio"], category: "devops" },
  { id: "skill:linkerd", label: "Linkerd", aliases: ["linkerd"], category: "devops" },
  { id: "skill:nginx", label: "Nginx", aliases: ["nginx"], category: "devops" },
  { id: "skill:linux", label: "Linux", aliases: ["linux", "ubuntu", "debian", "centos", "rhel", "alpine"], category: "devops" },
  { id: "skill:cicd", label: "CI/CD", aliases: ["ci/cd", "cicd", "ci cd", "continuous integration", "continuous delivery"], category: "devops" },
  { id: "skill:github-actions", label: "GitHub Actions", aliases: ["github actions"], category: "devops" },
  { id: "skill:jenkins", label: "Jenkins", aliases: ["jenkins"], category: "devops" },
  { id: "skill:gitlab-ci", label: "GitLab CI", aliases: ["gitlab ci", "gitlab-ci"], category: "devops" },
  { id: "skill:circleci", label: "CircleCI", aliases: ["circleci", "circle ci"], category: "devops" },
  { id: "skill:prometheus", label: "Prometheus", aliases: ["prometheus"], category: "devops" },
  { id: "skill:grafana", label: "Grafana", aliases: ["grafana"], category: "devops" },
  { id: "skill:datadog", label: "Datadog", aliases: ["datadog", "data dog"], category: "devops" },
  { id: "skill:newrelic", label: "New Relic", aliases: ["new relic", "newrelic"], category: "devops" },
  { id: "skill:elk", label: "ELK Stack", aliases: ["elk", "elk stack", "elastic stack"], category: "devops" },
  { id: "skill:sre", label: "SRE", aliases: ["sre", "site reliability engineering"], category: "devops" },
  { id: "skill:devops", label: "DevOps", aliases: ["devops"], category: "devops" },

  // ── Messaging / streaming
  { id: "skill:kafka", label: "Apache Kafka", aliases: ["kafka", "apache kafka"], category: "data" },
  { id: "skill:rabbitmq", label: "RabbitMQ", aliases: ["rabbitmq", "rabbit mq"], category: "data" },
  { id: "skill:nats", label: "NATS", aliases: ["nats", "nats jetstream"], category: "data" },
  { id: "skill:sqs", label: "AWS SQS", aliases: ["sqs", "aws sqs"], category: "data" },
  { id: "skill:pubsub", label: "Pub/Sub", aliases: ["pubsub", "pub/sub", "pub sub"], category: "data" },

  // ── Tools
  { id: "skill:git", label: "Git", aliases: ["git"], category: "tool" },
  { id: "skill:github", label: "GitHub", aliases: ["github"], category: "tool" },
  { id: "skill:gitlab", label: "GitLab", aliases: ["gitlab"], category: "tool" },
  { id: "skill:bitbucket", label: "Bitbucket", aliases: ["bitbucket"], category: "tool" },
  { id: "skill:jira", label: "Jira", aliases: ["jira"], category: "tool" },
  { id: "skill:confluence", label: "Confluence", aliases: ["confluence"], category: "tool" },
  { id: "skill:linear", label: "Linear", aliases: ["linear"], category: "tool" },
  { id: "skill:notion", label: "Notion", aliases: ["notion"], category: "tool" },
  { id: "skill:slack", label: "Slack", aliases: ["slack"], category: "tool" },
  { id: "skill:figma", label: "Figma", aliases: ["figma"], category: "tool" },
  { id: "skill:sketch", label: "Sketch", aliases: ["sketch"], category: "tool" },
  { id: "skill:adobe-xd", label: "Adobe XD", aliases: ["adobe xd", "xd"], category: "tool" },
  { id: "skill:photoshop", label: "Photoshop", aliases: ["photoshop", "adobe photoshop"], category: "tool" },
  { id: "skill:illustrator", label: "Illustrator", aliases: ["illustrator", "adobe illustrator"], category: "tool" },
  { id: "skill:webpack", label: "Webpack", aliases: ["webpack"], category: "tool" },
  { id: "skill:vite", label: "Vite", aliases: ["vite"], category: "tool" },
  { id: "skill:turborepo", label: "Turborepo", aliases: ["turborepo", "turbo"], category: "tool" },
  { id: "skill:nx", label: "Nx", aliases: ["nx"], category: "tool" },
  { id: "skill:postman", label: "Postman", aliases: ["postman"], category: "tool" },
  { id: "skill:storybook", label: "Storybook", aliases: ["storybook"], category: "tool" },
  { id: "skill:jest", label: "Jest", aliases: ["jest"], category: "tool" },
  { id: "skill:vitest", label: "Vitest", aliases: ["vitest"], category: "tool" },
  { id: "skill:playwright", label: "Playwright", aliases: ["playwright"], category: "tool" },
  { id: "skill:cypress", label: "Cypress", aliases: ["cypress"], category: "tool" },
  { id: "skill:selenium", label: "Selenium", aliases: ["selenium"], category: "tool" },

  // ── Product / Design
  { id: "skill:pm", label: "Product Management", aliases: ["product management", "product manager", "pm"], category: "product" },
  { id: "skill:ux", label: "UX Design", aliases: ["ux", "ux design", "user experience design"], category: "design" },
  { id: "skill:ui", label: "UI Design", aliases: ["ui", "ui design", "user interface design"], category: "design" },
  { id: "skill:wireframing", label: "Wireframing", aliases: ["wireframing", "wireframes"], category: "design" },
  { id: "skill:prototyping", label: "Prototyping", aliases: ["prototyping", "prototypes"], category: "design" },
  { id: "skill:user-research", label: "User Research", aliases: ["user research", "ux research", "user research methods"], category: "design" },
  { id: "skill:design-systems", label: "Design Systems", aliases: ["design system", "design systems"], category: "design" },
  { id: "skill:a11y", label: "Accessibility (a11y)", aliases: ["accessibility", "a11y", "wcag"], category: "design" },

  // ── Business
  { id: "skill:scrum", label: "Scrum", aliases: ["scrum", "scrum master"], category: "ops" },
  { id: "skill:agile", label: "Agile", aliases: ["agile", "agile methodology", "agile methodologies"], category: "ops" },
  { id: "skill:kanban", label: "Kanban", aliases: ["kanban"], category: "ops" },
  { id: "skill:waterfall", label: "Waterfall", aliases: ["waterfall"], category: "ops" },
  { id: "skill:lean", label: "Lean", aliases: ["lean", "lean six sigma", "six sigma"], category: "ops" },
  { id: "skill:pmp", label: "PMP", aliases: ["pmp", "project management professional"], category: "ops" },
  { id: "skill:itil", label: "ITIL", aliases: ["itil"], category: "ops" },
  { id: "skill:budgeting", label: "Budgeting", aliases: ["budgeting", "budget management"], category: "finance" },
  { id: "skill:forecasting", label: "Forecasting", aliases: ["forecasting", "financial forecasting"], category: "finance" },
  { id: "skill:accounting", label: "Accounting", aliases: ["accounting"], category: "finance" },
  { id: "skill:gaap", label: "GAAP", aliases: ["gaap"], category: "finance" },
  { id: "skill:cpa", label: "CPA", aliases: ["cpa", "certified public accountant"], category: "finance" },

  // ── Marketing & sales
  { id: "skill:seo", label: "SEO", aliases: ["seo", "search engine optimization"], category: "marketing" },
  { id: "skill:sem", label: "SEM", aliases: ["sem", "search engine marketing"], category: "marketing" },
  { id: "skill:google-ads", label: "Google Ads", aliases: ["google ads", "adwords"], category: "marketing" },
  { id: "skill:facebook-ads", label: "Facebook Ads", aliases: ["facebook ads", "fb ads"], category: "marketing" },
  { id: "skill:hubspot", label: "HubSpot", aliases: ["hubspot"], category: "marketing" },
  { id: "skill:salesforce", label: "Salesforce", aliases: ["salesforce", "sfdc"], category: "sales" },
  { id: "skill:crm", label: "CRM", aliases: ["crm"], category: "sales" },
  { id: "skill:b2b-sales", label: "B2B Sales", aliases: ["b2b sales", "enterprise sales"], category: "sales" },
  { id: "skill:cold-outreach", label: "Cold Outreach", aliases: ["cold outreach", "cold calling", "cold email"], category: "sales" },

  // ── HR
  { id: "skill:recruiting", label: "Recruiting", aliases: ["recruiting", "recruitment"], category: "hr" },
  { id: "skill:talent-acquisition", label: "Talent Acquisition", aliases: ["talent acquisition", "ta"], category: "hr" },
  { id: "skill:onboarding", label: "Employee Onboarding", aliases: ["onboarding", "employee onboarding"], category: "hr" },
  { id: "skill:l&d", label: "Learning & Development", aliases: ["l&d", "learning and development", "training"], category: "hr" },
  { id: "skill:compensation", label: "Compensation", aliases: ["compensation", "comp", "comp & benefits"], category: "hr" },

  // ── Security
  { id: "skill:infosec", label: "Information Security", aliases: ["infosec", "information security"], category: "domain" },
  { id: "skill:pentest", label: "Penetration Testing", aliases: ["pentest", "penetration testing", "pen test"], category: "domain" },
  { id: "skill:appsec", label: "Application Security", aliases: ["appsec", "application security"], category: "domain" },
  { id: "skill:cissp", label: "CISSP", aliases: ["cissp"], category: "domain" },
  { id: "skill:soc2", label: "SOC 2", aliases: ["soc 2", "soc2"], category: "domain" },
  { id: "skill:iso27001", label: "ISO 27001", aliases: ["iso 27001", "iso27001"], category: "domain" },
  { id: "skill:gdpr", label: "GDPR", aliases: ["gdpr"], category: "domain" },
  { id: "skill:hipaa", label: "HIPAA", aliases: ["hipaa"], category: "domain" },
  { id: "skill:pci", label: "PCI DSS", aliases: ["pci", "pci dss"], category: "domain" },

  // ── Soft skills
  { id: "skill:leadership", label: "Leadership", aliases: ["leadership"], category: "soft" },
  { id: "skill:mentoring", label: "Mentoring", aliases: ["mentoring", "mentorship", "coaching"], category: "soft" },
  { id: "skill:communication", label: "Communication", aliases: ["communication", "communication skills"], category: "soft" },
  { id: "skill:public-speaking", label: "Public Speaking", aliases: ["public speaking", "presentations"], category: "soft" },
  { id: "skill:writing", label: "Technical Writing", aliases: ["technical writing", "writing"], category: "soft" },
  { id: "skill:cross-functional", label: "Cross-Functional Collaboration", aliases: ["cross-functional", "cross functional collaboration", "stakeholder management"], category: "soft" },

  // Phase 38 — high-frequency modern tooling top-ups (the long tail is now
  // covered by semantic skill matching, so this is just the most common gaps).
  { id: "skill:clickhouse", label: "ClickHouse", aliases: ["clickhouse"], category: "database" },
  { id: "skill:duckdb", label: "DuckDB", aliases: ["duckdb"], category: "database" },
  { id: "skill:trino", label: "Trino", aliases: ["trino", "presto"], category: "data" },
  { id: "skill:airbyte", label: "Airbyte", aliases: ["airbyte"], category: "data" },
  { id: "skill:dagster", label: "Dagster", aliases: ["dagster"], category: "data" },
  { id: "skill:weaviate", label: "Weaviate", aliases: ["weaviate"], category: "data" },
  { id: "skill:qdrant", label: "Qdrant", aliases: ["qdrant"], category: "data" },
  { id: "skill:llamaindex", label: "LlamaIndex", aliases: ["llamaindex", "llama index", "llama-index"], category: "framework" },
  { id: "skill:vllm", label: "vLLM", aliases: ["vllm"], category: "data" },
  { id: "skill:bun", label: "Bun", aliases: ["bun", "bun.js"], category: "framework" },
  { id: "skill:deno", label: "Deno", aliases: ["deno"], category: "framework" },
  { id: "skill:tauri", label: "Tauri", aliases: ["tauri"], category: "framework" },
  { id: "skill:pulumi", label: "Pulumi", aliases: ["pulumi"], category: "devops" },
  { id: "skill:argocd", label: "Argo CD", aliases: ["argocd", "argo cd", "argo"], category: "devops" },
  { id: "skill:opentelemetry", label: "OpenTelemetry", aliases: ["opentelemetry", "otel"], category: "devops" },
  { id: "skill:temporal", label: "Temporal", aliases: ["temporal", "temporal.io"], category: "framework" },
];

// Lookup map built once at module load.
const ALIAS_TO_SKILL = new Map<string, CanonicalSkill>();
const ID_TO_SKILL = new Map<string, CanonicalSkill>();
for (const s of SKILL_TAXONOMY) {
  ID_TO_SKILL.set(s.id, s);
  for (const a of s.aliases) ALIAS_TO_SKILL.set(a, s);
}

/**
 * Normalize a free-text skill string into a canonical entry. Returns null
 * when no match — caller can fall back to LLM canonicalization.
 */
export function canonicalizeSkill(input: string): CanonicalSkill | null {
  const key = input.trim().toLowerCase();
  return ALIAS_TO_SKILL.get(key) ?? null;
}

export function getSkillById(id: string): CanonicalSkill | undefined {
  return ID_TO_SKILL.get(id);
}
