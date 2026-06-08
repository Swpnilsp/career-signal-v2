export interface TestCase {
  name: string;
  resumeText: string;
  linkedinText: string;
  jobDescription: string;
  clusterId: string;
  subRoleId: string;
}

export const staticTestCases: Record<string, TestCase> = {
  swapnil_ds: {
    name: "swapnil DS resume",
    clusterId: "data_ai",
    subRoleId: "data_scientist_product",
    resumeText: `SWAPNIL PATIL
Sunnyvale, CA 94089 • +1 (513) 652-0522 • swapnil_s_patil@outlook.com • LinkedIn • GitHub • Portfolio
PROFESSIONAL SUMMARY
Data Scientist working at the intersection of applied AI and product analytics, with experience across LLM evaluation, GenAI
safety, large-scale experimentation, and ML-driven integrity systems. Focused on turning ambiguous, messy problems into
measurable systems and decisions. Work spans model training pipelines, adversarial testing frameworks, real-time threat
detection, and decision-support tooling for human reviewers, with consistent impact across both research-adjacent and
product-facing environments.
KEY IMPACT
•
LLM training data quality: At Meta, improved SFT annotation accuracy by 8% by redesigning labeler assessment and
designing scalable evaluation frameworks, including ablation studies to isolate annotation quality signals and
automated feedback loops that caught labeling errors before they propagated into model tuning for content
moderation systems.
•
GenAI safety at scale: At Google, built adversarial red-teaming frameworks for GenAI features using simulation-based
prompt generation to create diverse multimodal test cases that stress-tested model behavior and drove robustness
improvements ahead of Pixel and Android product launches.
•
ML-powered integrity systems: Cut platform spam on Android Messages by 15% by building real-time detection
pipelines using LLM-based reasoning, vector embedding similarity, and behavioral analytics, with outputs directly
consumed by on-device models to drive early threat mitigation.
•
AI-assisted reviewer productivity: Reduced review handle time by 20% and lifted enforcement rates 8% by
embedding LLM-generated decision signals directly into Play App reviewer workflows which helped scale
enforcement capacity without adding headcount.
•
Product analytics & marketplace growth: At Walmart, reduced home grocery delivery failures 5% and pushed gig
driver offer acceptance up 100 bps through targeted A/B experiments on address validation and dynamic surge
pricing; grew driver activation 6% via funnel analysis and acquisition campaigns.
EXPERIENCE
Data Scientist | Meta Platforms (Facebook) Oct 2025 – Present
Menlo Park, CA
•
Lead cross-functional benchmarking of human-labeled SFT training data for content moderation models, defining
annotator quality metrics, designing causal experiments and ablation studies to measure labeler performance, and
translating findings into model tuning and production rollout decisions.
•
Built agentic analysis pipelines that automatically detect systematic annotation errors, surface root causes, and
recommend improvements to AI-assisted review tooling that lifted training label accuracy 8% and replaced a largely
manual investigation process with an automated one.
•
Developed measurement frameworks to evaluate the quality and throughput impact of labeling interventions, giving
the team a principled way to iterate on human-AI collaboration in annotation workflows.
Product Analyst (Data Scientist) | Google Feb 2021 – Oct 2025
Sunnyvale, CA
•
Designed adversarial red-teaming frameworks for GenAI product features, generating diverse multimodal prompts
through simulation to systematically identify model vulnerabilities used across multiple Pixel and Android launches to
drive measurable robustness improvements.
•
Built real-time spam detection pipelines for Android Messages that combined LLM reasoning, embedding-based
similarity search, and behavioral pattern analysis to identify emerging threat vectors early, with outputs directly
consumed by on-device models for proactive spam mitigation, reducing reported platform spam by 15%.
•
Applied LLM-based text classification on Play Store reviews to flag potentially harmful apps (enforcement rate up
8%), then integrated model-generated contextual signals into reviewer decision workflows to cut review time by 20%
•
Led platform integrity work using app metadata similarity analysis to detect misclassified Android apps and expand
policy coverage, reducing policy-violating apps on Google Play by 5%.
Product Analytics Manager | Walmart Labs Jan 2020 – Feb 2021
Sunnyvale, CA
•
Owned end-to-end A/B experimentation across online grocery, general merchandise, account redesign, and curbside
pickup and partnered directly with product and engineering teams to connect findings to decisions that moved NPS.
•
Reduced grocery delivery failures by 5% through experiments on address validation flows; lifted driver offer
acceptance 100 bps via dynamic pricing experiments during peak demand periods.
•
Built driver acquisition funnel pipelines and worked with the last-mile team on targeted campaigns that grew driver
activation 6% and expanded marketplace supply capacity.
Senior Marketing Analyst | Zulily LLC Sep 2018 – Jan 2020
Seattle, WA
•
Standardized experimentation frameworks, audience segmentation datasets, and reporting pipelines across
marketing, finance, and engineering that doubled weekly experiment throughput and improved average offer test
lift 200 bps.
•
Applied NLP and text mining to NPS survey data to identify the top 3 drivers of poor customer experience, then built
trigger-based lifecycle email campaigns around those moments which delivered a 4% demand lift.
•
Built a supervised classification model to distinguish unauthorized returns from undeliverable shipments, leading to a
revised returns policy that saved $8M annually; separately modeled the relationship between order-to-delivery time
and reorder rates, surfacing a $9M demand growth opportunity.
Business Analyst | Tech Mahindra Ltd. Jul 2011 – May 2017
Pune, India & Aldershot, UK
•
Built customer segmentation models using unsupervised learning and churn prediction models that improved
retention by 12% and reduced support contacts by 6%; developed ETL pipelines to process air cargo transaction data
for logistics and supply chain analytics.
SKILLS & TECHNICAL EXPERTISE
Generative AI & LLM Systems: LLM Evaluation & Benchmarking, Prompt Engineering, GenAI Safety, Adversarial
Red-Teaming, Agentic Workflows, AI Agents & Automation, Responsible AI (RAI), RLHF/SFT Data Quality,
Retrieval-Augmented Generation (RAG), Model Robustness Testing
Machine Learning & Statistical Modeling: Regression, Classification, Clustering, NLP , Text Mining, Sentiment Analysis,
Ensemble Methods (Bagging, Boosting), Dimensionality Reduction, Association Rules, TensorFlow, Scikit-learn
Experimentation & Causal Inference: A/B Testing, Hypothesis Testing, Simulation-based Testing, Causal Analysis,
Quasi-experimental Design, Experimentation at Scale, Statistical Power Analysis
Data & Engineering: Python, SQL, R, Unix Shell, BigQuery, Spark, Google Compute Engine, AWS, Apache Airflow, Hive,
Teradata, dbt, Git
Product & Analytics: Product Analytics, Funnel Analysis, Multi-Touch Attribution, CLTV, Metrics Definition & Goal-Setting,
Web Analytics, Google Analytics, Geospatial Analysis, Tableau, Excel
EDUCATION
MS, Business Analytics — University of Cincinnati, OH
BE, Computer Science — Government College of Engineering, India`,
    linkedinText: `headline- Swapnil Patil
Data Scientist @Meta | ex-Google
About
Experienced professional with a demonstrated history of working in Logistics, eCommerce and Digital Marketing industries. Skilled in R, SAS, Tableau, SQL, Business Analytics, Machine Learning and Data Science. 

Website- https://swpnilsp.github.io/Porfolio/
GitHub- https://github.com/Swpnilsp
Tableau Public- https://public.tableau.com/profile/swapnil.patil#!/
RPubs-https://rpubs.com/swapnil_s_patil

Experience

Meta logo
Data Scientist - AI Solutions & Automation

Meta · Full-time

Oct 2025 - Present · 8 mos

Menlo Park, California, United States · On-site

Google logo
Product Analytics, Responsible AI

Google · Full-time

Feb 2021 - Oct 2025 · 4 yrs 9 mos

Mountain View, California, United States · On-site

Member of GenAI launch team: 
1. AI Product Analytics
2. Synthetic Data Generation
3. AI Red Teaming
4. Human Feedback Reinforcement Learning

Google Play Product Analytics:
1. Causal inference
2. Experimentation & A/B Testing
3. Statistics
4. Trust & Safety… more

Walmart eCommerce logo
Walmart eCommerce

Full-time · 1 yr 2 mos

Advanced Analytics Manager 2, Customer Insights

Oct 2020 - Feb 2021 · 5 mos

Sunnyvale, California, United States

Product Analytics Manager

Jan 2020 - Sep 2020 · 9 mos

Sunnyvale

Key areas of work- 

· Product - Discovery / UX / Analytics
· Experimentation and Launch Planning / Strategy
· Analytics Specs
· Customer Account
· Last-Mile Delivery… more

zulily logo
Senior Marketing Analyst - Strategy, Lifecycle & Customer Experience

zulily · Full-time

Sep 2018 - Jan 2020 · 1 yr 5 mos

Greater Seattle Area

Utilizing analytics tools and designing experiments to help teams better understand customer behaviour for optimizing marketing spend, improving customer experience and NPS.

· Product Returns
· Experiment Design and AB Testing
· Web Analytics 
· Marketing (ROAS, Attribution, Incrementality Analysis)
· Customer Experience
· Customer Lifetime Value

Brandience logo
Graduate Student Consultant

Brandience

Jan 2018 - May 2018 · 5 mos

Cincinnati Metropolitan Area

As a graduate student consultant responsible to help increase the annual revenue of a national food delivery company. Major tasks involved in the data-driven project-
1. Customer Segmentation
2. Market Basket Analysis
3. Seasonality Analysis 
4. Behavioural Profiling  
5. Campaign Performance Evaluation`,
    jobDescription: `Job number
200005498
Date posted
Dec 16, 2025
Work site
3 days / week in-office
Travel
Less than 25%
Profession
Research, Applied, & Data Sciences
Discipline
Applied Sciences
Role type
Individual Contributor
Employment type
Full-Time
Overview
As Microsoft continues to push the boundaries of AI, we are looking for passionate individuals to work with us on new strategic efforts. Microsoft 365 Copilot is a groundbreaking productivity tool that leverages the power of large language models, the Microsoft Graph, and the web to drive unparalleled creativity and transform productivity in the enterprise.

As a Principal Applied Scientist (Multiple Positions) - MSAI Office of CTO you will design and develop LLMs (Large Language Model) and underlying subsystems to tailor to various product scenarios. We are looking for an individual who has the proven capability of working with research and engineering teams and partnering with them to deliver the best of joint class solutions.  This can range from alignments with senior stakeholders, working together to building models, to coming up, with ways to build custom LLMs and architecture for specific product needs (especially GenAI).

Microsoft’s mission is to empower every person and every organization on the planet to achieve more. As employees we come together with a growth mindset, innovate to empower others, and collaborate to realize our shared goals. Each day we build on our values of respect, integrity, and accountability to create a culture of inclusion where everyone can thrive at work and beyond.

Responsibilities
You will master a broad area or research and understand any applicable research techniques. You’ll also serve as a team expert on changes in industry trends, products, and other advances, and apply this knowledge to influence product needs.
You will review business and product requirement, incorporate research, and provide strategic direction for problem solving. You’ll also ensure scientific rigor, support the development of methods, and apply your expertise to support business impact.
Collaborate with stakeholders to gather and understand user requirements and expectations. Seek and incorporate continuous feedback from users and stakeholders to iteratively improve designs and solutions.
You will document work and experimentation results and share findings to promote innovation. You’ll provide guidance when capturing processes and contribute to ethics and privacy policies related to research processes and data collection.
Facilitate design meetings, creates design documents, and ensures alignment with project goals. Design system architecture that meets security, compliance, and scalability requirements.
Lead implementation and deployment of solutions, ensuring they meet quality standards. Translate project vision into actionable milestones and guide the team in project estimation and planning. Mentor and guide team members to produce extensible and maintainable code through code reviews and pair programming.
You will identify and inspire peers and new research talent to join Microsoft, build relationships, and advocate for research initiatives. You’ll share research findings through industry outreach, collaborate with the academic community, and help develop the recruiting pipeline.

Qualifications
Required Qualifications:

Bachelor's Degree in Statistics, Econometrics, Computer Science, Electrical or Computer Engineering, or related field AND 6+ years related experience (e.g., statistics, predictive analytics, research)
OR Master's Degree in Statistics, Econometrics, Computer Science, Electrical or Computer Engineering, or related field AND 4+ years related experience (e.g., statistics, predictive analytics, research)
OR Doctorate in Statistics, Econometrics, Computer Science, Electrical or Computer Engineering, or related field AND 3+ years related experience (e.g., statistics, predictive analytics, research)
OR equivalent experience.
Other Requirements:

Ability to meet Microsoft, customer and/or government security screening requirements are required for this role. These requirements include but are not limited to the following specialized security screenings:
Microsoft Cloud Background Check: This position will be required to pass the Microsoft Cloud background check upon hire/transfer and every two years thereafter.

Preferred Qualifications:
Bachelor's Degree in Statistics, Econometrics, Computer Science, Electrical or Computer Engineering, or related field AND 8+ years related experience (e.g., statistics, predictive analytics, research)
OR Master's Degree in Statistics, Econometrics, Computer Science, Electrical or Computer Engineering, or related field AND 6+ years related experience (e.g., statistics, predictive analytics, research)
OR Doctorate in Statistics, Econometrics, Computer Science, Electrical or Computer Engineering, or related field AND 5+ years related experience (e.g., statistics, predictive analytics, research)
OR equivalent experience.
3+ years’ experience developing and deploying AI/ML products or systems at multiple points in the product cycle from ideation to shipping. 
3+ years experience presenting at conferences or other events in the outside research/industry community as an invited speaker.
5+ years experience conducting research as part of a research program (in academic or industry settings).
5+ years experience creating publications (e.g., patents, libraries, peer-reviewed academic papers).
5+ years experience developing and deploying GenAI products or systems at multiple points in the product cycle from ideation to shipping.`
  }
};
