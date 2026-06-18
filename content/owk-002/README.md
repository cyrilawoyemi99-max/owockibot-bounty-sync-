# OWK-002 Public Goods Funding Thread Series

Deliverable for `owk-002`: a five-part Twitter/X thread series covering the history and future of public goods funding in crypto. Each thread has 12 ready-to-post entries, a clear final CTA, and a source block.

## Thread 1 - Why Crypto Keeps Returning To Public Goods

**Angle:** public goods are the infrastructure layer that markets depend on but often underpay.

1. Public goods funding is one of crypto's most important design problems: how do you pay for things everyone uses, but no single customer fully owns?
2. Open-source clients, security tooling, documentation, standards work, education, and coordination are all classic examples. They create shared upside, but their benefits spill across the whole ecosystem.
3. Traditional markets tend to underfund this work because the value is hard to meter. A wallet library can secure billions in activity without having a clean checkout page.
4. Crypto made this problem more visible because so much of the stack is open, composable, and public by default. That also means the funding problem can be addressed in public.
5. The early answer was grants: committees or foundations reviewed proposals, then funded teams before or during the work. Grants are simple, but they can favor polish, relationships, and proposal-writing.
6. Bounties added a different pattern: define a task, reward completion. This works well for scoped work, but it struggles with deep maintenance, long-term research, and invisible prevention.
7. Quadratic funding shifted attention toward community signal. It asks: how many people value a project enough to contribute, not just how much did one large donor give?
8. Retroactive funding flipped the timing. Instead of promising future impact, contributors can be rewarded after they create measurable value.
9. Protocol-level funding pushed the question even further: should systems route a durable share of value back to the people maintaining the base layer?
10. None of these mechanisms is perfect. Each has tradeoffs around capture, measurement, timing, and contributor trust.
11. The real story is not "one mechanism wins." It is that crypto is building a toolbox for funding work that markets need but do not naturally price.
12. CTA: if you rely on open-source crypto infrastructure, name one public good you used this week and trace how it is funded.

**Sources**

- Gitcoin, Quadratic Funding: https://gitcoin.co/mechanisms/quadratic-funding
- Gitcoin, Gitcoin Grants overview: https://gitcoin.co/blog/gitcoin-grants-quadratic-funding-for-the-world
- Optimism, Retro Funding 2025: https://www.optimism.io/blog/retro-funding-2025
- Protocol Guild overview: https://gitcoin.co/apps/protocol-guild

## Thread 2 - Quadratic Funding: Small Donors, Larger Signal

**Angle:** quadratic funding is a way to amplify breadth of support without pretending money is the only measure of value.

1. Quadratic funding is one of crypto's signature public goods experiments because it turns many small signals into a stronger allocation signal.
2. The basic idea: a matching pool is distributed based on the number of unique contributors, not only the total amount donated.
3. A project backed by 500 people giving small amounts can receive more matching support than a project backed by one large donor.
4. That matters because public goods often serve many people a little, rather than one buyer a lot. QF tries to make that broad usefulness visible.
5. Gitcoin Grants helped popularize this model in crypto by using QF rounds to fund open-source software, community work, education, and ecosystem tooling.
6. QF is not just fundraising. It is also a discovery layer. Donor participation can reveal which projects communities actually depend on.
7. The hard part is identity and collusion resistance. If matching depends on unique people, fake accounts and coordinated splitting can distort the signal.
8. That is why QF systems often need sybil resistance, eligibility rules, fraud review, and careful round design.
9. Another challenge is narrative bias. Projects that are easy to explain can attract support faster than maintenance work that quietly prevents failure.
10. The strongest QF rounds combine community signal with guardrails: clear scope, transparent matching rules, fraud review, and post-round reporting.
11. QF's biggest lesson is durable: funding should pay attention to how many humans benefit, not just who has the largest check.
12. CTA: before the next grants round you join, ask whether your donation is buying a product or sending a public signal.

**Sources**

- Gitcoin, Quadratic Funding: https://gitcoin.co/mechanisms/quadratic-funding
- Gitcoin, Gitcoin Grants overview: https://gitcoin.co/blog/gitcoin-grants-quadratic-funding-for-the-world
- Gitcoin quadratic funding implementation: https://github.com/gitcoinco/quadratic-funding

## Thread 3 - Retro Funding: Reward Impact After It Exists

**Angle:** retroactive funding changes the contributor promise from "trust my plan" to "measure what shipped."

1. Retroactive public goods funding starts with a simple claim: it is easier to judge impact after work exists than before it is built.
2. Instead of funding only proposals, retro funding rewards contributors who have already delivered value to an ecosystem.
3. Optimism made this model famous in crypto through RetroPGF and later Retro Funding programs.
4. The design tries to solve a common grant problem: proposal quality and impact quality are not the same thing.
5. A contributor may be bad at fundraising but excellent at shipping. Retro funding gives that contributor another path to sustainability.
6. The model also creates a cultural norm: do useful work, document impact, then let evaluators allocate rewards.
7. The tradeoff is timing. Contributors still need enough runway to build before a reward arrives.
8. Retro systems also need clear measurement. What counts as impact: users, revenue, security, developer adoption, governance value, or ecosystem resilience?
9. Optimism's 2025 plan shows how retro funding keeps evolving toward scoped rounds, better metrics, and more precise evaluation.
10. Retro funding is powerful when it is predictable enough for contributors to plan around, but independent enough to reward real results.
11. Its best use may be alongside grants and bounties: fund promising starts, reward proven outcomes, and keep a public record of what mattered.
12. CTA: if you are building in public, keep an impact log now. Retro funding cannot reward evidence you never collected.

**Sources**

- Optimism, Retro Funding 2025: https://www.optimism.io/blog/retro-funding-2025
- Gitcoin, Optimism RetroPGF overview: https://gitcoin.co/apps/optimism-retropgf
- Optimism Retro Funding repository: https://github.com/ethereum-optimism/Retro-Funding

## Thread 4 - Protocol Guild And Percent-For-Public-Goods

**Angle:** the next frontier is durable funding for people who keep base-layer systems alive.

1. Some public goods work is not a one-time task. It is years of review, maintenance, research, coordination, and incident response.
2. Ethereum core protocol work is a clear example: the ecosystem depends on it, but the work is distributed across many teams and individuals.
3. Protocol Guild addresses this by creating a collective funding mechanism for Ethereum Layer 1 core contributors.
4. The model makes contributor support more legible: a public registry, onchain distribution, and long-term vesting rather than one-off appreciation.
5. This is different from a bounty. It is not "fix one issue, get paid." It is "sustain the people maintaining the shared substrate."
6. Percent-for-public-goods takes a similar durability lesson and applies it to protocols, networks, and organizations.
7. Instead of relying only on discretionary grants, a system can commit a percentage of fees, revenue, token issuance, or treasury flows to public goods.
8. The benefit is predictability. Public goods teams can plan if funding is part of the system's economics rather than a periodic popularity contest.
9. The risk is governance capture. Durable streams need transparent eligibility, review, rotation, and accountability.
10. The future likely mixes both: long-term support for critical maintainers and competitive funding rounds for new contributors.
11. The bigger shift is philosophical: ecosystems should fund maintenance as a first-class cost, not as charity after growth is already captured.
12. CTA: when evaluating a protocol, ask not only how it rewards users, but how it funds the people keeping the protocol alive.

**Sources**

- Protocol Guild overview: https://gitcoin.co/apps/protocol-guild
- Gitcoin, Percent-for-Public-Goods: https://gitcoin.co/mechanisms/percent-for-public-goods
- Archived Protocol Guild docs: https://github.com/protocolguild/docs

## Thread 5 - What The Next Funding Stack Should Look Like

**Angle:** public goods funding improves when mechanisms become composable, evidence-rich, and contributor-friendly.

1. The future of crypto public goods funding is not one mega-round or one perfect allocation formula.
2. It is a funding stack: bounties for scoped tasks, grants for exploration, QF for community signal, retro funding for measured impact, and protocol streams for long-term maintenance.
3. The missing layer is better evidence. Contributors need portable proof of work, and funders need clearer signals before sending capital.
4. That proof can include PRs, releases, dashboards, audits, usage metrics, governance participation, support logs, and onchain payout receipts.
5. Reputation should not be a vanity score. It should help answer: what did this person ship, who benefited, and how reliable is the evidence?
6. This is where tools like owockibot can matter: they can connect bounty discovery, submission proof, contributor history, and payout status.
7. A good funding system should reduce overhead for contributors. The work should be "ship useful things and document them," not "become a professional grants operator."
8. It should also reduce ambiguity for funders. Clear scopes, public receipts, and normalized proof make it easier to reward work quickly.
9. The most effective systems will be multi-mechanism. QF can surface community demand. Retro funding can reward outcomes. Percent streams can sustain maintenance.
10. The hard problems remain: sybil resistance, evaluator quality, metric gaming, and making sure invisible maintenance is not ignored.
11. Still, crypto has a rare advantage: open work, public ledgers, programmable treasuries, and global contributors can all be tied into one funding loop.
12. CTA: pick one public-good project you depend on, find its funding route, and contribute one signal: a donation, issue, review, bounty, or useful proof.

**Sources**

- Gitcoin, Quadratic Funding: https://gitcoin.co/mechanisms/quadratic-funding
- Optimism, Retro Funding 2025: https://www.optimism.io/blog/retro-funding-2025
- Protocol Guild overview: https://gitcoin.co/apps/protocol-guild
- Ethereum Research discussion on public goods funding problems: https://ethresear.ch/t/three-fundamental-problems-in-ethereum-public-goods-funding-a-research-agenda/23474

## Source Appendix

- Gitcoin Quadratic Funding mechanism: https://gitcoin.co/mechanisms/quadratic-funding
- Gitcoin Grants overview: https://gitcoin.co/blog/gitcoin-grants-quadratic-funding-for-the-world
- Gitcoin Optimism RetroPGF overview: https://gitcoin.co/apps/optimism-retropgf
- Gitcoin Protocol Guild overview: https://gitcoin.co/apps/protocol-guild
- Gitcoin Percent-for-Public-Goods mechanism: https://gitcoin.co/mechanisms/percent-for-public-goods
- Optimism Retro Funding 2025: https://www.optimism.io/blog/retro-funding-2025
- Optimism Retro Funding repository: https://github.com/ethereum-optimism/Retro-Funding
- Archived Protocol Guild docs: https://github.com/protocolguild/docs
- Ethereum Research public goods funding agenda: https://ethresear.ch/t/three-fundamental-problems-in-ethereum-public-goods-funding-a-research-agenda/23474

## Validation Notes

- Exactly 5 threads.
- Exactly 12 ready-to-post entries per thread.
- Each thread ends with a CTA.
- Each thread has a source block.
- No account credentials, posting access, payment setup, or external publishing action is required for review.
