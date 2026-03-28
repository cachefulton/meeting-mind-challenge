# API Architecture Review — REST to GraphQL Migration
**Date:** March 18, 2025
**Duration:** 22 minutes
**Attendees:** Sarah Chen, Marcus Johnson, Priya Patel, David Kim

---

[00:00] Sarah Chen: Alright, so Marcus put together the proposal for migrating parts of our API to GraphQL. Marcus, you want to walk us through it?

[00:06] Marcus Johnson: Yeah, sure. So, um, this has been brewing for a while. The core issue is that our REST endpoints are getting really unwieldy for the dashboard and the project views. Priya, you can probably speak to this better than me, but the frontend is making like — what, five or six API calls just to render the project overview page?

[00:22] Priya Patel: Yeah, it's bad. The project overview does — let me think — it fetches the project metadata, then the task list, then the team members, then the recent activity feed, then the notification count, and then there's a separate call for the milestone data. So six calls. And half of them return way more data than we actually need. The task list endpoint returns the full task object when I really only need the title, status, and assignee for that view.

[00:43] Marcus Johnson: Right. Classic over-fetching. So the proposal is — and I want to be clear, I'm not saying we rewrite the whole API — the proposal is to add a GraphQL layer for the read-heavy frontend views. Specifically the dashboard, the project overview, and the reporting pages. We keep REST for all the write operations — task creation, updates, all that stuff. At least for now.

[01:05] Sarah Chen: So a hybrid approach.

[01:07] Marcus Johnson: Exactly. The GraphQL server would sit in front of our existing services and basically aggregate the data. Think of it as a BFF — backend for frontend — that speaks GraphQL.

[01:16] David Kim: Can I ask a dumb question? What's the actual user-facing impact here? Like, will customers notice?

[01:21] Marcus Johnson: It's not a dumb question. The answer is yes, they should notice. The project overview page right now takes, like, two to three seconds to fully load because of all those sequential API calls. With GraphQL, Priya can fetch everything in a single query. We're talking potentially sub-second load times.

[01:36] David Kim: Okay, that's compelling. The performance stuff keeps coming up in NPS surveys.

[01:40] Priya Patel: Can I jump in? So I'm very much in favor of this, but I have some concerns about the implementation. Are we using Apollo Server? And if so, are we going with schema-first or code-first?

[01:50] Marcus Johnson: I was thinking Apollo Server with code-first using TypeGraphQL. It plays nicely with our existing TypeScript codebase and we get type safety end to end.

[01:58] Priya Patel: Okay, and on the client side, I'd want to use Apollo Client. It has really good caching, which would actually help with our state management issues too. We've been struggling with keeping the sidebar task count in sync with the main view, and Apollo's normalized cache would basically solve that for free.

[02:14] Sarah Chen: Hold on, let me push back a little. Adding GraphQL is a big architectural change. It's another thing to maintain, another thing for new engineers to learn. What's the argument against just optimizing our REST endpoints? Like, could we just add a composite endpoint that returns everything the project overview needs?

[02:30] Marcus Johnson: We could, yeah. And I actually considered that. The problem is it's a band-aid. We'd end up building custom composite endpoints for every complex view, and each one is a maintenance headache. Every time the frontend changes what data it needs, we have to update the backend endpoint. GraphQL flips that — the frontend declares what it needs and the backend just serves it.

[02:48] Sarah Chen: Okay, that's fair. But what about the learning curve? You're the only person on the team who's done GraphQL in production.

[02:54] Marcus Johnson: That's true. Um, I think the learning curve is real but manageable. The schema definition is actually pretty intuitive, and Priya's already familiar with Apollo Client from a previous job, right?

[03:02] Priya Patel: Yeah, I used it at my last company. It's not bad. The resolver pattern takes a bit to wrap your head around, but once you get it, it's actually pretty elegant.

[03:10] Sarah Chen: Alright. I'm cautiously on board. Let's talk about the migration strategy. Are we doing a big bang cutover or incremental?

[03:17] Marcus Johnson: Definitely incremental. Phase one would be just the project overview page. We build the GraphQL schema for projects, tasks, team members, and activity — basically the data that page needs. We ship it behind a feature flag, run both the old REST version and the new GraphQL version simultaneously, and compare performance. If it works well, we move on to the dashboard in phase two.

[03:38] David Kim: I like the feature flag approach. Can we do an A/B test with it? Like, send 10% of traffic to the GraphQL version and measure actual page load times?

[03:45] Marcus Johnson: Yeah, we could do that through LaunchDarkly. We're already using it for feature flags.

[03:49] Sarah Chen: Good. Okay, so let's get into the technical details a bit. Marcus, where does the GraphQL server live? Is it a new service, or are we bolting it onto the existing API server?

[03:58] Marcus Johnson: So this is where it gets interesting. I think it should be a separate service. Keep it lightweight — it's just the GraphQL layer that talks to our existing microservices. If we bolt it onto the main API server, we're coupling the deployment pipeline and the failure modes.

[04:12] Sarah Chen: A separate service means another thing to deploy, monitor, and keep running. What's the operational overhead?

[04:17] Marcus Johnson: Minimal, honestly. It's a thin Node.js server. We can containerize it, throw it on the same ECS cluster. I'd set up the same CloudWatch dashboards and alarms we use for everything else. It's not like we're spinning up a whole new database — it's stateless. It just forwards to the existing services.

[04:32] Priya Patel: What about authentication though? Like, how do we handle auth tokens? Does the GraphQL server validate them directly or pass them through?

[04:38] Marcus Johnson: Good point. So the request would come in with the same JWT we use now. The GraphQL server validates it the same way the API gateway does — actually, it should sit behind the API gateway. So the gateway handles auth, then routes GraphQL requests to the new service and REST requests to the existing services. The token gets forwarded in the headers to downstream services.

[04:56] Sarah Chen: That sounds clean. What about rate limiting? Our REST API has per-endpoint rate limits. GraphQL is one endpoint.

[05:02] Marcus Johnson: Yeah, that's a known challenge with GraphQL. You can't just do simple per-endpoint rate limiting because a single query could be super cheap or could be trying to fetch the entire database. We'd need query complexity analysis. There are libraries for this — graphql-query-complexity is the one I've used before. You assign a cost to each field and set a maximum complexity per query.

[05:20] Sarah Chen: And you'd implement that from day one?

[05:22] Marcus Johnson: I think we have to. If we don't, someone's going to write a deeply nested query that brings down the whole thing. Even if it's just us internally at first, it's good hygiene.

[05:29] Sarah Chen: Agreed. Alright, Priya, from your end — how much frontend work is this?

[05:34] Priya Patel: So for just the project overview migration, I'd need to set up Apollo Client, write the queries, and refactor the data fetching layer on that page. I'd also want to set up the code generation pipeline — so, like, we define the schema on the backend and then auto-generate TypeScript types and query hooks on the frontend. That way we get end-to-end type safety.

[05:53] Marcus Johnson: Oh yeah, graphql-codegen. That's a must-have.

[05:56] Priya Patel: Right. Setup for that is probably a day. And then the actual page refactor — maybe a week? The tricky part is going to be the activity feed because it's currently using WebSocket updates, and I need to figure out how that interacts with Apollo's cache.

[06:09] Marcus Johnson: Hmm. For the activity feed, we could look at GraphQL subscriptions, but honestly that might be overcomplicating it for V1. What if we keep the activity feed on the existing WebSocket implementation and just use GraphQL for the initial data load?

[06:22] Priya Patel: Yeah, that's probably smarter. I'll look into whether Apollo Client can handle a hybrid model where some data comes from GraphQL queries and the real-time updates still come over the WebSocket. I'm pretty sure it can, but I want to prototype it.

[06:35] Sarah Chen: That sounds like a good spike. Can you time-box that to a day or two?

[06:39] Priya Patel: Yeah, I'll try to knock it out this week.

[06:42] David Kim: What about the reporting pages you mentioned? Is that phase two or phase three?

[06:46] Marcus Johnson: I'd say phase three, actually. Phase one is project overview, phase two is the main dashboard, phase three is reporting. Reporting is the most complex because of all the aggregation queries.

[06:55] David Kim: That works. From a product perspective, the dashboard performance is probably more impactful than reporting anyway. Most users hit the dashboard multiple times a day.

[07:03] Sarah Chen: Okay, I want to talk about risk for a second. What's the worst case scenario here? We invest time in this and then what goes wrong?

[07:10] Marcus Johnson: Um, worst case — the GraphQL layer adds latency instead of reducing it, because now every request has an extra hop through the GraphQL server before hitting the downstream services. We mitigate that by making sure the GraphQL server uses DataLoader for batching — so if a query needs data from, say, the tasks service and the users service, those calls happen in parallel, not sequentially.

[07:29] Sarah Chen: DataLoader is the Facebook pattern for batching?

[07:32] Marcus Johnson: Yeah, it's — basically, it collects all the data fetching calls in a single tick and batches them. So instead of N+1 queries, you get a single batched request per service. It's kind of table stakes for any serious GraphQL server.

[07:43] Priya Patel: The other risk I see is on the frontend. If we're not careful, we end up with a bunch of different query shapes for the same data and we lose the benefits of caching. I'd want to establish some conventions early — like, always request the ID and typename for cache normalization.

[07:56] Marcus Johnson: Agreed. We should probably write up some GraphQL query conventions as part of the migration guide.

[08:01] Sarah Chen: Good. Let's make sure that happens. Okay, I think I've heard enough to make a call on this. I'm going to approve the migration, but with guardrails. Phase one only — project overview page. Feature flagged. We measure latency and compare it to the REST version before we roll it to 100% of users. If the numbers don't show improvement, we pause and reassess. Sound fair?

[08:22] Marcus Johnson: Totally fair.

[08:23] Priya Patel: Works for me.

[08:24] David Kim: Makes sense from a product side too.

[08:26] Sarah Chen: Alright. Marcus, how does this interact with the Smart Notifications work? Is there a dependency?

[08:31] Marcus Johnson: No dependency. The GraphQL migration touches read paths, notifications is all write-side and a different set of services. They can run in parallel.

[08:38] Sarah Chen: Good. And timeline — when can you start, and how long for phase one?

[08:42] Marcus Johnson: I can start the schema design this week, actually. I think phase one is about three weeks of backend work. Setting up the server, defining the schema, writing the resolvers, DataLoader integration, complexity analysis, and then testing. I'll probably want to pair with Priya in the third week to make sure the schema works well for the frontend.

[09:00] Priya Patel: Yeah, I can start the client-side work in week two once the schema starts taking shape. I'll do the spike on the WebSocket hybrid this week.

[09:08] Sarah Chen: Okay, so roughly four weeks to get phase one behind a feature flag. Then a week of testing and comparison. Does that sound right?

[09:15] Marcus Johnson: Yeah, that's about right. I'll pad it a bit in my head for the unknowns.

[09:19] David Kim: One thing I want to make sure we don't forget — documentation. Our API docs are already not great. If we're adding a whole new query language on top, we need to have a GraphQL playground or something that people can use.

[09:30] Marcus Johnson: Apollo Server comes with a built-in playground called Apollo Studio Sandbox. We can also auto-generate docs from the schema. I'll make sure that's set up.

[09:38] Sarah Chen: Alright, I think we're solid. Let me summarize what I'm hearing. We're going ahead with a hybrid GraphQL and REST approach. GraphQL for read-heavy frontend views starting with the project overview, REST stays for writes. Separate service behind the API gateway. Feature flagged with A/B comparison. Marcus is leading backend, Priya is leading frontend. Phase one target is about four to five weeks.

[09:58] Marcus Johnson: That's it.

[09:59] Sarah Chen: Any open questions we haven't addressed?

[10:01] David Kim: Actually, yes. What about our mobile app? It uses the REST API too. Are we eventually going to want the mobile app on GraphQL as well? Because if so, we should think about that now in the schema design.

[10:11] Marcus Johnson: That's a great point. I'll design the schema to be client-agnostic — so it's not specifically tied to the web frontend's view structure. That way the mobile team could use it too down the road. But we're not building anything specifically for mobile right now.

[10:23] Sarah Chen: Good. Anything else? ... No? Alright, let's get it done. Thanks everyone.

[10:28] Priya Patel: Thanks!

[10:29] Marcus Johnson: Cool, see you all tomorrow.

[10:30] David Kim: Later.
