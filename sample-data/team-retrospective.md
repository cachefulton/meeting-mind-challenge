# Sprint 14 Retrospective
**Date:** March 7, 2025
**Duration:** 12 minutes
**Attendees:** Sarah Chen, Marcus Johnson, Priya Patel, David Kim, Lisa Torres

---

[00:00] Sarah Chen: Okay everybody, sprint 14 retro. I know it was a rough one, so let's just be honest and get through it. Same format as always — what went well, what didn't, and what we want to change. Who wants to start?

[00:11] Marcus Johnson: I'll go. Um, so obviously the elephant in the room is the incident on Wednesday night. The task service went down for about 45 minutes during peak hours for our EU customers. I was on call, and honestly, it was not a great experience.

[00:25] Sarah Chen: Let's dig into that. What happened, from your perspective?

[00:28] Marcus Johnson: So the root cause was that connection pool exhaustion thing we've been talking about for months. We knew it was a risk. We had it on the backlog. But it kept getting deprioritized because there was always something more urgent. And then Wednesday night, we had a traffic spike from that big onboarding — the Terramax account, right David? — and the connection pool just ran out.

[00:47] David Kim: Yeah, Terramax started migrating their data that afternoon. We knew they were onboarding but I don't think anyone realized how much data they were going to import at once.

[00:55] Marcus Johnson: Right, and that's — like, I don't want to point fingers, but that's kind of the thing. We should have had a heads-up that a big import was coming. I got paged at 11 PM with no context. I spent the first twenty minutes just figuring out what was going on.

[01:08] Sarah Chen: That's fair. David, is there a way we can flag large customer onboardings to the engineering team?

[01:13] David Kim: Absolutely. That's on me. I should have posted in #engineering-alerts. The CS team told me about it earlier that day and it just — it slipped through the cracks. I'm sorry about that, Marcus.

[01:22] Marcus Johnson: I appreciate that. Honestly, the thing that really got me was — and I know this is just how on-call works — but I was the only engineer awake. The runbook for the task service is basically nonexistent. I was reading source code at midnight trying to figure out how to resize the connection pool without restarting the whole service.

[01:39] Sarah Chen: Yeah, that's not okay. We need better runbooks.

[01:42] Lisa Torres: Can I just say — Marcus, I saw the Slack thread from that night and you handled it really well. Like, you were calm, you communicated clearly in the incident channel, you had it resolved in under an hour. I know it sucked, but you did a great job.

[01:54] Marcus Johnson: Thanks, Lisa. That means a lot, actually.

[01:57] Priya Patel: Yeah, seconding that. I felt bad seeing the messages the next morning. I wish I'd been awake to help.

[02:02] Sarah Chen: So let's talk about what we actually want to do about this. Marcus, you mentioned runbooks. What else?

[02:08] Marcus Johnson: So a few things. One, we need to fix the connection pool issue for real. Not just bump the limits — actually implement proper connection pooling with PgBouncer or something. Two, runbooks for every critical service, with clear escalation paths. And three — and this is maybe controversial — I think we need to revisit the on-call rotation. Having one person covering everything is brutal. Can we at least do a primary and secondary?

[02:32] Sarah Chen: I hear you on all three. The connection pool fix — that should be the top priority this sprint, no question. Marcus, can you own that? Get a proper PgBouncer setup in place?

[02:41] Marcus Johnson: Yeah. I'll make it happen.

[02:43] Sarah Chen: The on-call thing is tricky because we're a small team. Let me think about that and talk to my manager. I don't want to promise something I can't deliver.

[02:50] Marcus Johnson: I understand. I just needed to say it out loud.

[02:53] Sarah Chen: And you should. Okay, what about the runbooks? That's a bigger effort.

[02:57] Priya Patel: Could we maybe do a team runbook day? Like, we each pick a service and write the runbook for it? It'd take a day but we'd come out of it with way better documentation.

[03:06] Sarah Chen: I like that idea. Let's schedule it. Priya, can you set that up? Find a day in the next two weeks that works for everyone?

[03:12] Priya Patel: Sure, I'll send a poll out today.

[03:15] David Kim: On the customer onboarding heads-up — I'm going to set up a process where anytime the CS team flags a large onboarding, I post it in #engineering-alerts at least 48 hours in advance. I'll talk to Jen about it today.

[03:26] Sarah Chen: Great. Okay, let's move on to what went well. It wasn't all bad, right? Priya, you shipped the new task filtering, yeah?

[03:33] Priya Patel: Yeah! That actually went really smoothly. Lisa's designs were super clear, the edge cases were all accounted for in the mocks, and Marcus's API endpoints were solid. It was like — one of those rare things where everything just worked.

[03:45] Lisa Torres: Aw, thanks. That was a fun one to design, honestly. The user feedback in #feature-requests was so specific, it made my job easy.

[03:52] David Kim: And customers are already loving it. I saw three positive tweets about it. Well, one was about us and two were about the filtering feature specifically. Still counts.

[04:00] Priya Patel: Ha, I'll take it.

[04:02] Sarah Chen: That's awesome. What made that work so well? Can we replicate it?

[04:06] Priya Patel: I think it was the upfront alignment. We had that really thorough design review before I wrote any code. All the questions were answered before I started. Compare that to — remember the dashboard redesign last sprint where I was going back and forth with Lisa like five times during implementation?

[04:19] Lisa Torres: Yeah, that was my fault. I didn't account for the responsive breakpoints in the original designs. I've been trying to be more thorough about that now.

[04:27] Sarah Chen: It sounds like the lesson is — spend more time in design review upfront, even if it feels slow. It pays off in implementation speed.

[04:33] David Kim: Totally. I've been thinking we should maybe do design reviews earlier in the process too. Like, before I finalize the PRD. Lisa and I have been working more closely this sprint and it's been better.

[04:43] Lisa Torres: Yeah, the collab has been good. Would be nice to formalize that somehow though. Like maybe a standing weekly design-product sync?

[04:50] David Kim: We could just add 30 minutes to our Monday afternoon slot. I'm down for that.

[04:54] Lisa Torres: Cool, let's try it.

[04:56] Sarah Chen: Alright, any other things that went well or didn't go well? We've got a few minutes.

[05:00] Marcus Johnson: One small thing — the deploy pipeline has been flaky the last couple weeks. Like, one out of every four or five deploys fails with some Docker layer caching issue and you have to retry it. It's not blocking but it's annoying and it wastes time.

[05:13] Sarah Chen: Yeah, I've noticed that too. Do we know the root cause?

[05:16] Marcus Johnson: I think it's the GitHub Actions runner running out of disk space. The Docker cache fills up and then the build fails. We probably just need to add a cache cleanup step.

[05:24] Sarah Chen: Is that a quick fix?

[05:26] Marcus Johnson: Probably like an hour of work. I can — well, actually, can someone else take that? I'm already heads-down on the connection pool fix and the Smart Notifications design doc and now the GraphQL stuff. I'm kind of stretched thin.

[05:36] Priya Patel: I can look at it. I've messed with the CI pipeline before.

[05:39] Sarah Chen: That'd be great, Priya. No rush on it though — if you can get to it this sprint, great, if not, it's not critical.

[05:44] Marcus Johnson: Thanks, Priya.

[05:46] David Kim: Oh, one more thing on the "didn't go well" side. We committed to seven stories this sprint and only finished five. I'm not blaming anyone — the incident ate into everyone's time. But I want to make sure we right-size the next sprint. Maybe we plan for six and see how it goes.

[05:59] Sarah Chen: Agreed. And we should factor in the connection pool work, which is unplanned but essential. Let's pull one or two lower-priority items out of the next sprint to make room.

[06:08] David Kim: I'll reprioritize the backlog before planning tomorrow.

[06:11] Lisa Torres: Quick thought — and this might be a bigger conversation — but should we think about having some kind of buffer built into every sprint? Like, we always plan to 80% capacity instead of 100%? Every sprint something unexpected comes up and we end up scrambling.

[06:24] Sarah Chen: That's actually a really good idea. I've seen other teams do that. Let's — let's discuss it more in sprint planning tomorrow. I don't want to make a snap decision on it but I think it has merit.

[06:33] Marcus Johnson: Please. That would make on-call so much less stressful if there was actual slack in the sprint for incident response.

[06:39] Sarah Chen: Okay, I think we're at time. Let me recap the real action items. Marcus is fixing the connection pool with PgBouncer, top priority this sprint. Priya is scheduling the team runbook writing day and will look at the CI pipeline issue if she has bandwidth. David is setting up the large-customer-onboarding alert process with the CS team. And we're going to discuss the 80% capacity planning idea in tomorrow's sprint planning.

[07:02] Sarah Chen: Anything I missed?

[07:04] Lisa Torres: I think that covers it.

[07:05] Marcus Johnson: Yep. Hopefully sprint 15 is less exciting.

[07:08] Priya Patel: Ha, fingers crossed.

[07:10] David Kim: Boring sprints are good sprints.

[07:12] Sarah Chen: Amen to that. Alright, thanks everyone. Good retro. See you at planning tomorrow.

[07:16] Marcus Johnson: Later.

[07:17] Lisa Torres: Bye!

[07:18] Priya Patel: See ya.
