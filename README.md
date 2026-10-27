# Financial Document Explainer
Upload a loan agreement, credit card statement, or benefit notice and receive a plain-language summary flagging fees, rate changes, and risk items.

This is a Next.js app built to provide analysis of financial documents using Anthropic Claude (claude-sonnet-5).

## Key points

### 1. No financial advice:

A persistent disclaimer is displayed below the input, and announced once to screen readers. The assistant describes and flags what documents say; it does not recommend actions. If asked for advice, it declines and explains why.


### 2. PII handling:

a. The PDFs are loaded directly into Claude and no parsing logic/libraries are used. This preserves the PDF content intact like tables and graphs for Claude to analyze accurately. 

b. The app does not store any financial documents on disk/DB. This is a decision taken considering PII handling. Claude still sees the PII during analysis.

c. The documents are parsed and analysed directly in Claude commercial endpoint wherein the data is not used for training purposes and is deleted after 7 days as per Claude terms.

d. The PII information is masked in the response provided in the context defined in skills/analyzer.md. The account numbers are masked and the addresses, SSNs, names are omitted in its responses.


### 3. Anthropic API Key handling:
The API key is set in .env.local file and is not set as public (not prefixed with NEXT_PUBLIC_) ensuring the key is loaded on the server side and is not accessible at browser level.


### 4. Accessibility (a11y):
The app's main functionalities are accessible. Tested via VoiceOver + MacOS. Not yet tested with NVDA or JAWS.


## Scope
Financial document format: PDF only (32MB / 100 pages, Anthropic limits), images deferred, no auth or saved history in v1


## Setup

### Prerequisites
1. Node.js
2. Code Editor (Ex: VS Code)

### Local run

1. Clone the repo:
https://github.com/dhavans1/financial-doc-explainer.git

2. Install dependencies:
```npm install```

3. Add anthropic API key:
Create .env.local file under root folder [ financial-doc-explainer/.env.local ]. 
Add the API KEY entry in .env.local file and replace YOUR_API_KEY with actual API key ```ANTHROPIC_API_KEY=YOUR_API_KEY```

4. Run one of the appropriate below commands to start the local build
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Stack
1. Next.js 16 App Router
2. Vercel AI SDK
3. TypeScript
4. Tailwind 4
