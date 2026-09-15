import React from 'react';
import Code from './Code';
import { Chapter, Section, FileCode, Download } from './LessonParts';

export default function ChapterSix() {
  return <Chapter number="06" title="Performance and load testing" intro="Build a bounded local load experiment for the same API. Measure latency distributions, throughput, and correctness under browsing, quoting, and simulated checkout traffic.">
    <Section id="6.1" title="Defining response-time, throughput, and error targets">
      <h3>Step 1. Write a measurable experiment</h3>
      <p>Keep the existing tests and <code>tests/helpers/api.js</code>. Run the unit, integration, and security API suites first; they should pass 28, 6, and 7 cases. Measuring a broken checkout quickly is not a useful performance baseline.</p>
      <p>For this exercise, require zero unexpected statuses, invalid checked payloads, timeouts, or transport errors, and a p95 below 500 ms for each endpoint. These are generous local learning budgets, not customer service-level objectives. Report throughput rather than inventing a universal requests-per-second minimum for unknown hardware.</p>
      <p>Latency measures the time from a request starting until its JSON body is consumed and checked. p95 is the nearest-rank 95th percentile: sort the samples and pick the observation at ceil(0.95 × count). Throughput is completed HTTP attempts divided by elapsed wall time, including simulated thinking. Neither measure describes browser paint or internet latency.</p>
      <h3>Step 2. Create the load harness</h3><FileCode path="tests/performance/load.mjs"/>
      <p>The parent generates traffic and a child process hosts the actual API on an ephemeral loopback port. This prevents client work from sharing the API’s JavaScript event loop. Both processes still compete for your machine’s CPU and memory, which limits capacity claims.</p>
    </Section>
    <Section id="6.2" title="Modeling realistic shopping traffic">
      <h3>Step 3. Read the traffic loop before running it</h3>
      <p>Each virtual shopper has a session and repeatedly fetches products, requests a one-notebook quote, and pauses 20 ms. Every fifth iteration also attempts a declined checkout. At the end, each shopper successfully buys one clip. Warmup creates sessions outside the measured window.</p>
      <p>The ratio is an explicit teaching workload: two routine requests per iteration plus occasional checkout. A real workload should use observed conversion, think times, cart sizes, and cache behavior. Twenty milliseconds keeps the exercise short; it is not a claim about human shopping speed.</p>
      <p>Declines return the expected 402 and do not drain stock; they are not counted as infrastructure errors. Successful purchases are separately checked for 201 and a 1678-cent total. The largest profile uses 24 clips, below the initial stock of 50. Repeated purchases of all inventory would otherwise measure expected stock rejections rather than checkout capacity.</p>
      <p>This is a closed workload: each shopper waits for a response before its next request. When the server slows, the offered request rate falls. It can therefore understate overload compared with an independent arrival-rate model. For a later production experiment, choose an arrival model and separate load-generator host intentionally.</p>
      <p>Reference: <a href="https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/">Grafana k6’s explanation of open and closed workload models</a>.</p>
    </Section>
    <Section id="6.3" title="Load-testing browsing and checkout">
      <h3>Step 4. Capture a baseline, then increase concurrency</h3>
      <Code>{`node tests/performance/load.mjs baseline
node tests/performance/load.mjs load`}</Code>
      <p>Expected: each command prints a JSON summary, saves <code>performance-baseline.json</code> or <code>performance-load.json</code>, and exits successfully if all endpoint budgets pass. Baseline uses 1 shopper × 20 iterations: 45 measured requests. Load uses 8 × 50: 888 measured requests. Exact milliseconds and throughput depend on your machine.</p>
      <p>The summary includes errors, p95 by endpoint, request count, completed journeys, runtime, Node version, and platform. A journey count means the loop completed, not that every request passed; inspect the separate error count. Timeouts remain in latency samples and count as errors so a slow failed request cannot disappear from the result.</p>
      <p>Compare endpoint distributions as well as overall p95. Fast browsing can hide a small group of slow order requests in an aggregate percentile. The harness enforces the 500 ms budget on each endpoint, and validates representative response bodies as well as status codes.</p>
      <p>If a run fails, save its output before rerunning. Record CPU model, power mode, other workloads, and the commit under test alongside the generated file. A failed budget is evidence to investigate, not permission to increase the budget silently.</p>
    </Section>
    <Section id="6.4" title="Testing sales spikes, system limits, and sustained load">
      <h3>Step 5. Run bounded burst and sustained-work profiles</h3>
      <Code>{`node tests/performance/load.mjs spike
node tests/performance/load.mjs soak`}</Code>
      <p>Expected: spike performs 1608 measured requests with 24 shoppers × 30 iterations; soak performs 4404 with 4 × 500. Each starts fresh state and writes its own report. These are a short abrupt-concurrency experiment and a longer repetition experiment; the soak is still only seconds to tens of seconds, not a multi-hour endurance certification.</p>
      <p>Run baseline again after the spike and compare results. Because each invocation starts a fresh server, that checks repeatability on the host, not recovery of the same process after overload. Testing recovery in one long-running process would require a staged workload with ramp-up, spike, and cooldown in that same session.</p>
      <p>To investigate limits, copy a profile into the <code>profiles</code> object and increase iterations first. Keep users at or below 50 unless you redesign the final purchase fixture; otherwise the finite clip stock invalidates the expected 201 responses. Stop an experiment when error rate rises, the server becomes unresponsive, or the generator saturates. Capture the first failing level and reproduce it before claiming a limit.</p>
      <p>The server stores sessions and orders without eviction. This harness reuses a bounded set of sessions, so it does not measure unbounded new-visitor memory growth. A dedicated endurance study must model that growth and record memory over time; document it as untested here.</p>
    </Section>
    <Section id="6.5" title="Finding bottlenecks and measuring improvements">
      <h3>Step 6. Compare like with like</h3>
      <p>Run the load profile three times at one commit, preserving each JSON report under a different filename before it is overwritten. Repeat under the same conditions after one change. Compare median run-level p95 and throughput, individual endpoint tails, and errors; do not select only the best run.</p>
      <p>High latency with low CPU suggests a different investigation from high latency with a saturated event loop. For this tiny in-memory API, JSON handling, connection overhead, and the load generator may dominate. In a future database-backed store, examine query timing, locks, connection pools, and slow external services before optimizing a pure pricing helper.</p>
      <p>A controlled exercise: add a temporary awaited 600 ms delay immediately before the products response in <code>server/api.js</code>, using the incremental edit below. Run baseline; expect a nonzero exit and products p95 over 500 ms. Remove the added line, rerun baseline, and keep the original functional suites green.</p>
      <Code>{`// Insert immediately before the GET /api/products routing condition, then remove after the exercise:
if (req.method === 'GET' && url.pathname === '/api/products') await new Promise(resolve => setTimeout(resolve, 600));`}</Code>
      <p>This demonstrates that the budget can fail on a known slowdown; it is not a discovered bottleneck. Do not add timing assertions to the deterministic unit suite. Chapter 07 keeps this machine-sensitive experiment in a separate manually triggered CI job.</p>
      <Download number="06" slug="performance" next="/chapters/regression-testing/" nextTitle="Continue to regression testing"/>
    </Section>
  </Chapter>;
}
