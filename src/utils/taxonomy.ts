// Role taxonomy + scoring configuration engine.
// Internal routing only — evaluation dimensions surfaced to users are human-readable;
// keyword profiles, weights, and evaluation models are NEVER shown in the UI.

export type ClusterId =
  | "data_ai"
  | "swe"
  | "product"
  | "ai_builder"
  | "design_research"
  | "entry"
  | "other";

export type EvaluationModel =
  | "hybrid_reasoning_metrics_experiments"
  | "structure_systems_keyword_depth"
  | "narrative_impact_decision_clarity"
  | "llm_application_architecture_evaluation"
  | "fundamentals_trajectory_potential"
  | "generalist_contextual_evaluation";

export type KeywordProfile = {
  must_have: string[];
  preferred: string[];
  missing_penalty_keywords: string[];
};

export type JobMatchingConfig = {
  embedding_weight: number;
  keyword_weight: number;
  experience_alignment_weight: number;
  impact_signal_weight: number;
  hard_filters: string[];
  boost_signals: string[];
};

export type SubRole = {
  id: string;
  label: string;
  blurb: string;
  keyword_profile: KeywordProfile;
  hard_filters?: string[];
  boost_signals?: string[];
};

export type Cluster = {
  id: ClusterId;
  label: string;
  tagline: string;
  accent: string;
  rubric: string[];
  evaluation_model: EvaluationModel;
  default_weights: Omit<JobMatchingConfig, "hard_filters" | "boost_signals">;
  sub_roles: SubRole[];
};

const DATA_AI_WEIGHTS = {
  embedding_weight: 0.35,
  keyword_weight: 0.25,
  experience_alignment_weight: 0.2,
  impact_signal_weight: 0.2,
};

const SWE_WEIGHTS = {
  embedding_weight: 0.3,
  keyword_weight: 0.3,
  experience_alignment_weight: 0.25,
  impact_signal_weight: 0.15,
};

const PM_WEIGHTS = {
  embedding_weight: 0.35,
  keyword_weight: 0.15,
  experience_alignment_weight: 0.2,
  impact_signal_weight: 0.3,
};

const AI_BUILDER_WEIGHTS = {
  embedding_weight: 0.3,
  keyword_weight: 0.3,
  experience_alignment_weight: 0.15,
  impact_signal_weight: 0.25,
};

const DESIGN_WEIGHTS = {
  embedding_weight: 0.4,
  keyword_weight: 0.15,
  experience_alignment_weight: 0.2,
  impact_signal_weight: 0.25,
};

const ENTRY_WEIGHTS = {
  embedding_weight: 0.3,
  keyword_weight: 0.25,
  experience_alignment_weight: 0.15,
  impact_signal_weight: 0.3,
};

const OTHER_WEIGHTS = {
  embedding_weight: 0.4,
  keyword_weight: 0.2,
  experience_alignment_weight: 0.2,
  impact_signal_weight: 0.2,
};

export const CLUSTERS: Cluster[] = [
  {
    id: "data_ai",
    label: "Data / AI / Analytics",
    tagline: "Data science, ML, analytics, experimentation, and data systems",
    accent: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    rubric: [
      "Data reasoning & analytical thinking",
      "Experimentation & causal reasoning",
      "Machine learning depth",
      "Data pipelines & system thinking",
      "Metrics & business impact",
      "Communication & insight clarity",
    ],
    evaluation_model: "hybrid_reasoning_metrics_experiments",
    default_weights: DATA_AI_WEIGHTS,
    sub_roles: [
      {
        id: "data_scientist_product",
        label: "Data Scientist (Product / Experimentation)",
        blurb: "Experimentation, causal inference, product metrics",
        keyword_profile: {
          must_have: ["SQL", "experimentation", "A/B testing", "metrics"],
          preferred: ["causal inference", "Python", "regression", "product analytics"],
          missing_penalty_keywords: ["A/B testing", "statistical significance", "hypothesis testing"],
        },
        boost_signals: ["shipped experiments", "metric movement", "product impact"],
      },
      {
        id: "machine_learning_engineer",
        label: "Machine Learning Engineer",
        blurb: "Production ML systems, training pipelines, serving",
        keyword_profile: {
          must_have: ["Python", "PyTorch", "TensorFlow", "model training", "production"],
          preferred: ["MLOps", "Kubernetes", "feature store", "model serving", "distributed training"],
          missing_penalty_keywords: ["production deployment", "model monitoring", "CI/CD"],
        },
        boost_signals: ["models in production", "latency reduction", "training infra"],
      },
      {
        id: "applied_scientist",
        label: "Applied Scientist",
        blurb: "Research-flavored ML applied to product problems",
        keyword_profile: {
          must_have: ["machine learning", "research", "Python", "publications or patents"],
          preferred: ["deep learning", "NLP", "computer vision", "experimentation"],
          missing_penalty_keywords: ["novel methods", "evaluation rigor"],
        },
        boost_signals: ["publications", "patents", "novel architectures"],
      },
      {
        id: "analytics_engineer",
        label: "Analytics Engineer",
        blurb: "dbt, modeling, modern data stack",
        keyword_profile: {
          must_have: ["SQL", "dbt", "data modeling", "warehouse"],
          preferred: ["Snowflake", "BigQuery", "Airflow", "data quality"],
          missing_penalty_keywords: ["dbt", "data modeling", "version-controlled SQL"],
        },
        boost_signals: ["data platform ownership", "model coverage", "self-serve analytics"],
      },
      {
        id: "data_engineer",
        label: "Data Engineer",
        blurb: "Batch + streaming pipelines, warehousing, ingestion",
        keyword_profile: {
          must_have: ["ETL", "SQL", "data pipelines", "Python or Scala"],
          preferred: ["Airflow", "Spark", "Kafka", "Snowflake", "BigQuery"],
          missing_penalty_keywords: ["pipeline reliability", "data quality", "schema design"],
        },
        boost_signals: ["pipeline SLAs", "data volume scale", "cost optimization"],
      },
      {
        id: "experimentation_growth_analyst",
        label: "Experimentation / Growth Analyst",
        blurb: "A/B tests, funnel analysis, growth loops",
        keyword_profile: {
          must_have: ["experimentation", "A/B testing", "SQL", "growth"],
          preferred: ["causal inference", "funnel analysis", "retention", "LTV"],
          missing_penalty_keywords: ["statistical significance", "experiment design"],
        },
        boost_signals: ["lifts shipped", "north-star metric impact"],
      },
      {
        id: "product_analyst",
        label: "Product Analyst",
        blurb: "Analytics embedded in product decisions",
        keyword_profile: {
          must_have: ["SQL", "product analytics", "metrics", "dashboards"],
          preferred: ["Amplitude", "Mixpanel", "experimentation", "Python"],
          missing_penalty_keywords: ["decisions influenced", "insight → action"],
        },
        boost_signals: ["decisions driven", "feature insights"],
      },
      {
        id: "bi_data_analyst",
        label: "BI / Data Analyst",
        blurb: "SQL, dashboards, stakeholder-facing insights",
        keyword_profile: {
          must_have: ["SQL", "dashboards", "reporting", "analysis"],
          preferred: ["Tableau", "Looker", "Power BI", "Python", "Excel"],
          missing_penalty_keywords: ["stakeholder communication", "business impact"],
        },
        boost_signals: ["decisions driven", "exec-level reporting"],
      },
      {
        id: "mlops_engineer",
        label: "MLOps Engineer",
        blurb: "Model serving, monitoring, CI/CD for ML",
        keyword_profile: {
          must_have: ["MLOps", "model deployment", "CI/CD", "monitoring"],
          preferred: ["Kubernetes", "MLflow", "Kubeflow", "feature store", "Docker"],
          missing_penalty_keywords: ["model monitoring", "drift detection", "deployment automation"],
        },
        boost_signals: ["production model count", "reduced deployment time"],
      },
      {
        id: "ml_platform_engineer",
        label: "ML Platform Engineer",
        blurb: "Internal ML platforms, training infra, feature stores",
        keyword_profile: {
          must_have: ["ML platform", "infrastructure", "Python", "distributed systems"],
          preferred: ["Ray", "Kubernetes", "feature store", "training infra", "GPU"],
          missing_penalty_keywords: ["platform adoption", "developer productivity"],
        },
        boost_signals: ["ML platform ownership", "internal users", "throughput gains"],
      },
    ],
  },
  {
    id: "swe",
    label: "Software Engineering",
    tagline: "Backend, frontend, systems, infra, security, and engineering leadership",
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    rubric: [
      "Coding proficiency & problem solving",
      "System design & architecture thinking",
      "Scalability & performance awareness",
      "Production engineering maturity",
      "Reliability & operational excellence",
    ],
    evaluation_model: "structure_systems_keyword_depth",
    default_weights: SWE_WEIGHTS,
    sub_roles: [
      {
        id: "backend_engineer",
        label: "Backend Engineer",
        blurb: "APIs, services, data layer",
        keyword_profile: {
          must_have: ["backend", "API", "database", "production"],
          preferred: ["Go", "Java", "Python", "PostgreSQL", "Kafka", "microservices"],
          missing_penalty_keywords: ["system design", "scalability", "API design"],
        },
      },
      {
        id: "frontend_engineer",
        label: "Frontend Engineer",
        blurb: "Modern web UI, performance, design systems",
        keyword_profile: {
          must_have: ["React", "TypeScript", "HTML", "CSS"],
          preferred: ["Next.js", "performance", "accessibility", "design system"],
          missing_penalty_keywords: ["accessibility", "performance metrics", "component architecture"],
        },
      },
      {
        id: "full_stack_engineer",
        label: "Full Stack Engineer",
        blurb: "End-to-end product engineering",
        keyword_profile: {
          must_have: ["React", "TypeScript", "backend", "REST or GraphQL"],
          preferred: ["Next.js", "Node", "PostgreSQL", "AWS"],
          missing_penalty_keywords: ["shipped features end-to-end"],
        },
      },
      {
        id: "mobile_engineer",
        label: "Mobile Engineer",
        blurb: "iOS / Android / React Native",
        keyword_profile: {
          must_have: ["iOS", "Android", "Swift", "Kotlin", "React Native"],
          preferred: ["MVVM", "push notifications", "offline-first", "App Store"],
          missing_penalty_keywords: ["app shipped to store", "crash-free rate"],
        },
      },
      {
        id: "distributed_systems_engineer",
        label: "Distributed Systems Engineer",
        blurb: "High-scale data + compute systems",
        keyword_profile: {
          must_have: ["distributed systems", "scale", "consensus or replication"],
          preferred: ["Kafka", "Spark", "Cassandra", "Raft", "Paxos"],
          missing_penalty_keywords: ["throughput", "latency budgets", "fault tolerance"],
        },
      },
      {
        id: "infra_platform_engineer",
        label: "Infrastructure / Platform Engineer",
        blurb: "Internal platforms, CI/CD, observability",
        keyword_profile: {
          must_have: ["Kubernetes", "Terraform", "CI/CD", "AWS or GCP"],
          preferred: ["observability", "SLO", "Docker", "Helm"],
          missing_penalty_keywords: ["platform ownership", "developer productivity"],
        },
      },
      {
        id: "sre_production_engineer",
        label: "SRE / Production Engineer",
        blurb: "Reliability, on-call, incident response, SLOs",
        keyword_profile: {
          must_have: ["SRE", "reliability", "on-call", "monitoring"],
          preferred: ["SLO", "SLI", "incident response", "Prometheus", "Grafana", "chaos engineering"],
          missing_penalty_keywords: ["uptime", "MTTR", "error budget"],
        },
        boost_signals: ["incident leadership", "uptime improvements"],
      },
      {
        id: "security_engineer",
        label: "Security Engineer",
        blurb: "AppSec, infra security, detection & response",
        keyword_profile: {
          must_have: ["security", "threat modeling", "authentication"],
          preferred: ["SAST", "DAST", "SIEM", "zero trust", "incident response"],
          missing_penalty_keywords: ["vulnerability remediation", "secure SDLC"],
        },
      },
      {
        id: "engineering_manager",
        label: "Engineering Manager",
        blurb: "Team leadership, delivery, technical direction",
        keyword_profile: {
          must_have: ["engineering manager", "team", "leadership", "delivery"],
          preferred: ["hiring", "mentorship", "roadmap", "cross-functional"],
          missing_penalty_keywords: ["team size", "outcomes delivered", "people growth"],
        },
        boost_signals: ["team scaling", "promotions enabled", "org impact"],
      },
      {
        id: "solutions_customer_engineer",
        label: "Solutions / Customer Engineer",
        blurb: "Pre/post-sales technical engineering with customers",
        keyword_profile: {
          must_have: ["solutions engineer", "customer", "integration", "technical"],
          preferred: ["API", "demos", "POC", "enterprise"],
          missing_penalty_keywords: ["customer outcomes", "deals influenced"],
        },
        boost_signals: ["revenue influenced", "customer expansion"],
      },
    ],
  },
  {
    id: "product",
    label: "Product / Strategy",
    tagline: "Product management, growth, strategy, and analytics-driven decisions",
    accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    rubric: [
      "Product thinking & user empathy",
      "Execution & ownership of outcomes",
      "Data-informed decision making",
      "Strategic prioritization",
      "Communication & stakeholder influence",
    ],
    evaluation_model: "narrative_impact_decision_clarity",
    default_weights: PM_WEIGHTS,
    sub_roles: [
      {
        id: "product_manager",
        label: "Product Manager",
        blurb: "0→1 and 1→n product ownership",
        keyword_profile: {
          must_have: ["product manager", "roadmap", "stakeholders", "metrics"],
          preferred: ["user research", "experimentation", "north-star metric", "PRD"],
          missing_penalty_keywords: ["shipped product", "measurable impact"],
        },
      },
      {
        id: "technical_product_manager",
        label: "Technical Product Manager",
        blurb: "Platform/API/infra PM with engineering depth",
        keyword_profile: {
          must_have: ["technical product", "API", "platform", "engineering background"],
          preferred: ["system design", "developer experience", "SDK", "infra"],
          missing_penalty_keywords: ["technical specs authored", "engineering trade-offs"],
        },
      },
      {
        id: "growth_product_manager",
        label: "Growth Product Manager",
        blurb: "Acquisition, activation, retention loops",
        keyword_profile: {
          must_have: ["growth", "experimentation", "funnel", "retention"],
          preferred: ["A/B testing", "onboarding", "lifecycle", "LTV", "CAC"],
          missing_penalty_keywords: ["lifts shipped", "north-star metric"],
        },
      },
      {
        id: "platform_pm",
        label: "Platform PM",
        blurb: "Internal platforms, developer-facing products",
        keyword_profile: {
          must_have: ["platform", "API", "internal tools", "developer"],
          preferred: ["SDK", "documentation", "self-serve", "observability"],
          missing_penalty_keywords: ["adoption metrics", "developer NPS"],
        },
      },
      {
        id: "ai_product_manager",
        label: "AI Product Manager",
        blurb: "PM for ML/LLM-powered products",
        keyword_profile: {
          must_have: ["AI", "ML", "product manager", "metrics"],
          preferred: ["LLM", "evals", "RAG", "agents", "data labeling"],
          missing_penalty_keywords: ["model evals", "AI product trade-offs", "hallucination handling"],
        },
      },
      {
        id: "product_marketing_manager",
        label: "Product Marketing Manager",
        blurb: "Positioning, GTM, launches, messaging",
        keyword_profile: {
          must_have: ["product marketing", "positioning", "launch", "messaging"],
          preferred: ["GTM", "competitive analysis", "personas", "enablement"],
          missing_penalty_keywords: ["launch outcomes", "pipeline influenced"],
        },
        boost_signals: ["successful launches", "category creation"],
      },
      {
        id: "strategy_bizops_analyst",
        label: "Strategy / BizOps Analyst",
        blurb: "Strategic analysis, operating cadence, exec support",
        keyword_profile: {
          must_have: ["strategy", "business operations", "analysis", "SQL or Excel"],
          preferred: ["modeling", "OKRs", "executive", "market analysis"],
          missing_penalty_keywords: ["decisions influenced", "strategic recommendations"],
        },
        boost_signals: ["exec-level decisions", "company strategy shaped"],
      },
      {
        id: "program_manager",
        label: "Program Manager",
        blurb: "Cross-functional technical/product program delivery",
        keyword_profile: {
          must_have: ["program manager", "cross-functional", "delivery", "stakeholders"],
          preferred: ["technical program", "roadmap", "risk", "dependencies"],
          missing_penalty_keywords: ["programs delivered", "scope managed"],
        },
        boost_signals: ["multi-team programs", "on-time launches"],
      },
    ],
  },
  {
    id: "ai_builder",
    label: "AI / LLM Builders",
    tagline: "GenAI-native roles: LLM apps, agents, RAG, evaluation, safety",
    accent: "from-rose-500/20 to-pink-500/10 border-rose-500/30",
    rubric: [
      "LLM system design capability",
      "Retrieval & knowledge integration (RAG)",
      "Agent design & tool usage",
      "Evaluation rigor & iteration mindset",
      "Practical AI product shipping ability",
    ],
    evaluation_model: "llm_application_architecture_evaluation",
    default_weights: AI_BUILDER_WEIGHTS,
    sub_roles: [
      {
        id: "llm_application_engineer",
        label: "LLM Application Engineer",
        blurb: "Production-grade LLM features",
        keyword_profile: {
          must_have: ["LLM", "OpenAI or Anthropic", "Python or TypeScript", "production"],
          preferred: ["evals", "guardrails", "streaming", "function calling"],
          missing_penalty_keywords: ["evals", "latency", "cost optimization"],
        },
      },
      {
        id: "rag_engineer",
        label: "RAG Engineer",
        blurb: "Retrieval pipelines, embeddings, vector stores",
        keyword_profile: {
          must_have: ["RAG", "embeddings", "vector database", "retrieval"],
          preferred: ["pgvector", "Pinecone", "Weaviate", "reranking", "chunking"],
          missing_penalty_keywords: ["retrieval eval", "chunking strategy"],
        },
      },
      {
        id: "agent_engineer",
        label: "Agent Engineer",
        blurb: "Tool-using agents, planning, multi-step workflows",
        keyword_profile: {
          must_have: ["agents", "tools", "LLM", "multi-step"],
          preferred: ["LangGraph", "function calling", "planning", "memory"],
          missing_penalty_keywords: ["agent reliability", "evaluation harness"],
        },
      },
      {
        id: "ai_product_engineer",
        label: "AI Product Engineer",
        blurb: "Full-stack engineer shipping AI features",
        keyword_profile: {
          must_have: ["AI product", "full stack", "LLM", "shipped"],
          preferred: ["React", "TypeScript", "streaming UI", "evals"],
          missing_penalty_keywords: ["user-facing AI shipped"],
        },
      },
      {
        id: "ai_startup_engineer",
        label: "AI Startup Engineer",
        blurb: "Generalist engineer at an AI startup",
        keyword_profile: {
          must_have: ["LLM", "shipped", "full stack", "speed"],
          preferred: ["startup", "0 to 1", "evals", "infra"],
          missing_penalty_keywords: ["product shipped quickly", "ownership"],
        },
      },
      {
        id: "prompt_workflow_engineer",
        label: "Prompt / Workflow Engineer",
        blurb: "Workflow design, prompt systems, automation",
        keyword_profile: {
          must_have: ["prompt engineering", "workflow", "LLM"],
          preferred: ["Zapier", "n8n", "evals", "templating"],
          missing_penalty_keywords: ["evaluation", "iteration loop"],
        },
      },
      {
        id: "llm_evaluation_engineer",
        label: "LLM Evaluation Engineer",
        blurb: "Eval harnesses, benchmarks, regression detection for LLMs",
        keyword_profile: {
          must_have: ["LLM evaluation", "evals", "benchmark", "metrics"],
          preferred: ["LLM-as-judge", "ground truth", "regression", "human eval"],
          missing_penalty_keywords: ["eval design", "metric reliability"],
        },
        boost_signals: ["eval framework built", "quality gates shipped"],
      },
      {
        id: "ai_safety_red_team",
        label: "AI Safety / Red Team Engineer",
        blurb: "Adversarial testing, jailbreaks, safety evaluation",
        keyword_profile: {
          must_have: ["AI safety", "red team", "adversarial", "LLM"],
          preferred: ["jailbreak", "alignment", "policy", "threat modeling"],
          missing_penalty_keywords: ["safety evals", "harm reduction"],
        },
        boost_signals: ["vulnerabilities surfaced", "policy work"],
      },
    ],
  },
  {
    id: "design_research",
    label: "Design / Research",
    tagline: "UX, product design, research, and behavioral insights",
    accent: "from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/30",
    rubric: [
      "User understanding & empathy",
      "Design thinking & product intuition",
      "Research quality & insight generation",
      "Communication of findings",
      "Collaboration with product/engineering",
    ],
    evaluation_model: "narrative_impact_decision_clarity",
    default_weights: DESIGN_WEIGHTS,
    sub_roles: [
      {
        id: "product_designer",
        label: "Product Designer / UX Designer",
        blurb: "End-to-end product design across web and mobile",
        keyword_profile: {
          must_have: ["product design", "UX", "Figma", "prototyping"],
          preferred: ["design system", "interaction design", "user research", "accessibility"],
          missing_penalty_keywords: ["shipped designs", "outcomes influenced"],
        },
        boost_signals: ["features shipped", "design leadership"],
      },
      {
        id: "ux_researcher",
        label: "UX Researcher",
        blurb: "Generative + evaluative research informing product decisions",
        keyword_profile: {
          must_have: ["user research", "interviews", "usability", "insights"],
          preferred: ["mixed methods", "survey", "synthesis", "research ops"],
          missing_penalty_keywords: ["decisions influenced", "research impact"],
        },
        boost_signals: ["strategic insights", "research that shifted roadmap"],
      },
      {
        id: "design_systems_designer",
        label: "Design Systems Designer",
        blurb: "Tokens, components, governance, cross-team enablement",
        keyword_profile: {
          must_have: ["design system", "components", "tokens", "Figma"],
          preferred: ["accessibility", "documentation", "governance", "Storybook"],
          missing_penalty_keywords: ["system adoption", "consistency metrics"],
        },
        boost_signals: ["adoption across teams", "velocity improvements"],
      },
      {
        id: "behavioral_research_analyst",
        label: "Behavioral Research Analyst",
        blurb: "Behavioral science applied to product and user decisions",
        keyword_profile: {
          must_have: ["behavioral research", "experimentation", "analysis"],
          preferred: ["behavioral science", "psychology", "survey", "qualitative"],
          missing_penalty_keywords: ["insights to action", "decisions influenced"],
        },
        boost_signals: ["behavioral interventions shipped"],
      },
    ],
  },
  {
    id: "entry",
    label: "Entry / Career Switch / Early Career",
    tagline: "New grads, internships, bootcamps, and career transitions",
    accent: "from-stone-500/20 to-amber-700/10 border-stone-500/30",
    rubric: [
      "Fundamentals & technical basics",
      "Project quality & hands-on experience",
      "Learning trajectory & growth potential",
      "Communication & clarity",
      "Problem-solving ability",
    ],
    evaluation_model: "fundamentals_trajectory_potential",
    default_weights: ENTRY_WEIGHTS,
    sub_roles: [
      {
        id: "new_grad_swe",
        label: "New Grad — Software Engineer",
        blurb: "CS degree or equivalent, looking for first SWE role",
        keyword_profile: {
          must_have: ["computer science", "internship or projects", "data structures"],
          preferred: ["Python or Java or C++", "system design basics", "open source"],
          missing_penalty_keywords: ["internship", "shipped project", "GitHub"],
        },
      },
      {
        id: "new_grad_ds",
        label: "New Grad — Data Scientist",
        blurb: "Stats/CS background, first DS role",
        keyword_profile: {
          must_have: ["statistics", "SQL", "Python", "projects"],
          preferred: ["machine learning", "experimentation", "Kaggle", "thesis"],
          missing_penalty_keywords: ["end-to-end project", "metrics"],
        },
      },
      {
        id: "new_grad_pm",
        label: "New Grad — Product Manager",
        blurb: "APM, RPM, or new-grad PM programs",
        keyword_profile: {
          must_have: ["product", "leadership", "metrics", "communication"],
          preferred: ["case competitions", "founder", "user research"],
          missing_penalty_keywords: ["shipped product", "stakeholder ownership"],
        },
      },
      {
        id: "internship",
        label: "Internship",
        blurb: "Summer or co-op internships",
        keyword_profile: {
          must_have: ["coursework", "projects", "team work"],
          preferred: ["previous internship", "open source", "research"],
          missing_penalty_keywords: ["shipped project", "ownership"],
        },
      },
      {
        id: "bootcamp_grad",
        label: "Bootcamp Graduate",
        blurb: "Coding bootcamp grad targeting first dev role",
        keyword_profile: {
          must_have: ["JavaScript", "React", "Node", "projects"],
          preferred: ["TypeScript", "deployment", "team project", "capstone"],
          missing_penalty_keywords: ["deployed project", "real users"],
        },
      },
      {
        id: "career_switcher",
        label: "Career Switcher (non-tech → tech)",
        blurb: "Transitioning from another field",
        keyword_profile: {
          must_have: ["transferable skills", "projects", "self-taught"],
          preferred: ["bootcamp or courses", "portfolio", "domain expertise"],
          missing_penalty_keywords: ["hands-on projects", "translated domain into tech"],
        },
      },
      {
        id: "early_career_analyst",
        label: "Early Career Analyst",
        blurb: "First analyst role across BI, ops, or product",
        keyword_profile: {
          must_have: ["SQL or Excel", "analysis", "internship or projects"],
          preferred: ["dashboards", "Python", "statistics", "stakeholder"],
          missing_penalty_keywords: ["decisions influenced", "structured analysis"],
        },
      },
    ],
  },
  {
    id: "other",
    label: "Other",
    tagline: "Cross-domain or ambiguous roles — evaluated contextually",
    accent: "from-slate-500/20 to-zinc-500/10 border-slate-500/30",
    rubric: [
      "Role clarity & positioning",
      "Depth of relevant experience",
      "Impact & ownership",
      "Communication & narrative",
      "Transferable strengths",
    ],
    evaluation_model: "generalist_contextual_evaluation",
    default_weights: OTHER_WEIGHTS,
    sub_roles: [
      {
        id: "general_tech_other",
        label: "General Tech / Other Roles",
        blurb: "Fallback for roles that don't clearly map to a cluster",
        keyword_profile: {
          must_have: [],
          preferred: [],
          missing_penalty_keywords: [],
        },
        boost_signals: ["clear positioning", "demonstrated impact"],
      },
    ],
  },
];

export function getCluster(id: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.id === id);
}

export function getSubRole(clusterId: string, subRoleId: string): SubRole | undefined {
  return getCluster(clusterId)?.sub_roles.find((s) => s.id === subRoleId);
}

export type RoleConfig = {
  role_cluster: ClusterId;
  sub_role: string;
  sub_role_label: string;
  cluster_label: string;
  scoring_rubric: string[];
  evaluation_model: EvaluationModel;
  keyword_profile: KeywordProfile;
  job_matching_config: JobMatchingConfig;
};

export function buildRoleConfig(
  clusterId: string,
  subRoleId: string,
): RoleConfig {
  const cluster = getCluster(clusterId);
  if (!cluster) throw new Error(`Unknown role cluster: ${clusterId}`);
  const sub = cluster.sub_roles.find((s) => s.id === subRoleId);
  if (!sub) throw new Error(`Unknown sub-role: ${subRoleId} in ${clusterId}`);

  return {
    role_cluster: cluster.id,
    sub_role: sub.id,
    sub_role_label: sub.label,
    cluster_label: cluster.label,
    scoring_rubric: cluster.rubric,
    evaluation_model: cluster.evaluation_model,
    keyword_profile: sub.keyword_profile,
    job_matching_config: {
      ...cluster.default_weights,
      hard_filters: sub.hard_filters ?? [],
      boost_signals: sub.boost_signals ?? [],
    },
  };
}
