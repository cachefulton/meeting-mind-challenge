# Smart Notifications Feature — Product Planning
**Date:** March 11, 2025
**Duration:** 16 minutes
**Attendees:** Sarah Chen, Marcus Johnson, Priya Patel, David Kim, Lisa Torres

---

[00:00] Sarah Chen: Okay, I think we're all here. Let me just — is Priya on? I see her name but her camera's off.

[00:04] Priya Patel: Yeah, I'm here. Sorry, I'm in the cafe today, so camera off. The wifi here is actually pretty decent though.

[00:09] Sarah Chen: No worries. Alright, David, you want to kick us off?

[00:12] David Kim: Yeah, sure. So, um, the big thing on the roadmap this quarter is Smart Notifications. This has been the number one customer complaint for like three straight months. People are drowning in notifications — every comment, every status change, every assignment — it all hits them the same way. And the result is people just turn notifications off entirely, which is honestly worse than having bad notifications.

[00:30] Priya Patel: Yeah, I saw that thread in #customer-feedback. Someone said they get like 200 notifications a day from us. Two hundred.

[00:36] David Kim: Exactly. And that was a mid-size account. I can only imagine what the enterprise customers are dealing with.

[00:41] Marcus Johnson: I mean, to be fair, some of that is because we default everything to "notify." Like, even when someone changes a label on a task, the assignee gets notified. That's probably not necessary.

[00:49] David Kim: Right, and that's exactly what we're trying to fix. So the idea is, instead of this dumb firehose of notifications, we build a system that's actually smart about what it surfaces and when. Think priority-based filtering, batched digests, quiet hours — the whole thing.

[01:02] Sarah Chen: Makes sense. Do we have a sense of scope? Because "smart notifications" could mean a lot of things. I've seen this kind of project balloon really fast.

[01:09] David Kim: Totally. So I've been working with Lisa on some early concepts, and I think for V1 we want to focus on three pillars. One — notification priority levels. So critical stuff like @-mentions and due-date changes always come through immediately, but lower-priority stuff gets batched or suppressed. Two — digest mode. Users can opt into a daily or twice-daily digest email instead of real-time notifications. And three — quiet hours. Let people set do-not-disturb windows so they're not getting pinged at 11 PM.

[01:35] Marcus Johnson: That's a solid scope. Quick question though — are we talking about just in-app notifications, or email and push too?

[01:41] David Kim: Good question. For V1, I was thinking in-app and email. Push notifications are a whole different beast because we'd need to coordinate with the mobile team, and honestly, I don't want to block on their timeline. They're already slammed with the offline mode stuff.

[01:53] Sarah Chen: Yeah, I agree. Let's keep push out of V1. We can always add it in a fast follow. There's no point waiting on—

[01:58] Marcus Johnson: Yeah, the mobile team is like two sprints behind already.

[02:01] Sarah Chen: Exactly. Okay, so in-app and email only for V1. That's our first decision.

[02:06] Lisa Torres: I've got some early wireframes, by the way — I dropped them in the Figma project yesterday. The notification preferences page and the digest email template. They're rough but should give everyone an idea of the direction. I'll drop the link in the chat.

[02:17] David Kim: Oh nice, I hadn't seen the email template yet.

[02:19] Lisa Torres: Yeah, I just finished it last night. It's based on that inspiration board I shared in #design a couple weeks ago — the Notion digest email is really good, so I borrowed some of their patterns.

[02:28] Priya Patel: Oh, I saw those wireframes. Quick question on the preferences page — are we doing per-project notification settings or is it global? Because in the mocks it looked like it could go either way.

[02:37] Lisa Torres: So, I actually mocked up both options. Per-project is more flexible and definitely what power users want, but the UI gets complex fast. You end up with this matrix of project times notification type times channel, and it's just — it's overwhelming. My recommendation is we start with global settings and then add per-project overrides later if people ask for it.

[02:55] Marcus Johnson: How many notification types are there right now? Like, in our system?

[02:59] David Kim: Um, off the top of my head — task assigned, task completed, comment added, comment mentioned, due date changed, status changed, label changed, attachment added, project member added, and I think a few more. Probably like twelve or thirteen total.

[03:12] Marcus Johnson: And you want per-project settings for all of those? Yeah, that's a combinatorial nightmare.

[03:16] Lisa Torres: Exactly.

[03:17] David Kim: Yeah, I like Lisa's recommendation. Let's go with global for V1. If enterprise customers start asking for per-project, we'll revisit. That's, um — does everyone agree with that?

[03:26] Sarah Chen: Works for me.

[03:27] Marcus Johnson: Same.

[03:28] Priya Patel: Yeah, global is way simpler from a frontend perspective. I was going to say — the settings page is already kind of a mess. Adding a per-project notification matrix would make it way worse.

[03:36] David Kim: Cool. So that's decision two — global notification preferences for V1, no per-project.

[03:41] Sarah Chen: Okay, let's talk about the backend side. Marcus, what are you thinking for the priority classification? Like, how do we decide what's "critical" versus "low priority"?

[03:49] Marcus Johnson: So I've been thinking about this a bit. I think we need a rules engine, basically. We define a default priority for each notification type — so like, @-mentions are always high, someone adding a comment to a task you're watching is medium, someone changing a label is low. And the user can customize these defaults in their settings if they want. And then eventually we could layer ML on top of that to personalize priorities based on user behavior, but for V1, rules-based is totally fine.

[04:12] David Kim: I love that. Start simple, get smarter later. We don't need machine learning to tell people that @-mentions are important.

[04:18] Sarah Chen: Yeah. What about the batching logic though? Like, how does the digest actually work on the backend?

[04:23] Marcus Johnson: Yeah, so this is the more interesting engineering problem. Right now notifications are fire-and-forget — they hit the notifications table and the WebSocket pushes them out immediately. There's no queue, no batching, nothing. For digest mode, we'd need to queue notifications up and then have a cron job or — actually, probably a more robust job scheduler — that assembles the digest and sends it at the user's preferred time.

[04:44] Priya Patel: What about time zones? Because if someone sets their digest for 9 AM, that needs to be 9 AM their time, not UTC or whatever.

[04:50] Marcus Johnson: Right, yeah. We already store user time zones in the profile, so we can use that. The job scheduler would need to process batches per time zone, basically. Like, it wakes up and says "okay, it's 9 AM in Eastern, who wants their digest now?" and then processes that batch.

[05:02] David Kim: How many time zones are we talking about?

[05:04] Marcus Johnson: Well, there are like 38 distinct UTC offsets in the real world, but practically speaking, our users are mostly in US, Europe, and some in Asia. So maybe a dozen time zones that actually matter.

[05:14] Sarah Chen: Okay, that makes sense. I want to make sure we're not over-engineering this though. Marcus, can you write up a short technical design doc? Just the notification pipeline changes, the queue architecture, and how the digest job would work. Nothing crazy, like two or three pages.

[05:27] Marcus Johnson: Yeah, I can do that. I'll have it by end of week — Friday at the latest.

[05:31] Sarah Chen: Perfect. Let's review it in Monday's architecture sync.

[05:35] David Kim: One thing I want to flag — we need to figure out the default settings for new users. Like, when someone signs up for Meridian, do we opt them into digest mode, or do we keep real-time as default and let them discover the digest option themselves?

[05:46] Lisa Torres: Hmm, from a UX perspective, I'd say keep real-time as the default. If we change the behavior without people opting in, we're gonna get a flood of support tickets from confused users asking "why did my notifications stop?" Better to surface it as a recommendation. Like, maybe after someone's been using the product for a week and they've gotten a certain number of notifications, we show an onboarding tooltip that says "Hey, you've gotten 150 notifications this week. Want to try digest mode?"

[06:08] Priya Patel: Oh, that's clever. Context-aware nudging.

[06:11] David Kim: That's really smart. I love that. We should definitely do the nudge. Okay, so real-time stays the default, digest is opt-in, and we nudge people towards it when it makes sense.

[06:20] Sarah Chen: I like the nudge idea but I want to scope-check — is building the contextual nudge part of V1 or is that a follow-up?

[06:26] David Kim: Hmm. Good question. The nudge is nice-to-have, not essential. Let's make it a stretch goal for V1. If there's time, great. If not, it's V1.1.

[06:34] Lisa Torres: Yeah, that's fair. I'll design it either way so it's ready to go.

[06:37] Sarah Chen: Okay, so decision three — real-time stays the default, digest is opt-in. Nudge is stretch goal.

[06:43] Priya Patel: Can I bring up the frontend work for a sec? So the notification preferences page — is this going in the existing Settings section, or are we building a new dedicated Notifications hub? Because I've seen some apps that have like a whole separate notifications center.

[06:55] Lisa Torres: I had it in Settings in my mocks. But honestly, I could see it going either way. A dedicated hub would give us more room to grow.

[07:02] David Kim: Let's keep it in Settings for V1. We don't want to introduce a new top-level nav item just for this — it adds complexity to the information architecture. We can always promote it later if notifications become a bigger surface area in the product.

[07:12] Priya Patel: Okay, cool. That simplifies things. Although I will say — the Settings page is already getting pretty crowded. We've got profile, account, billing, integrations, and now notifications. Maybe I should add a tabbed layout or side nav. I've been meaning to refactor that page anyway.

[07:25] Lisa Torres: Actually, I've been wanting to redesign the Settings page for a while. We could—

[07:29] Sarah Chen: Okay, let's not scope-creep the Settings redesign into this project. Priya, do what you need to do to make notifications fit, but let's keep the Settings overhaul as a separate thing.

[07:37] Priya Patel: Fair enough. I'll probably just add a tab bar. It's minimal work and it makes room for notifications.

[07:42] Sarah Chen: Sounds reasonable. Priya, can you put together a rough estimate for the frontend work? Like, story points or just a rough number of days? I need it for capacity planning.

[07:50] Priya Patel: Sure. I'll look at Lisa's Figma mocks more carefully and estimate by Thursday. I'll put it in the JIRA epic.

[07:56] David Kim: Oh speaking of JIRA — I created the epic yesterday. MERID-1247. I'll add everyone here as watchers.

[08:02] Sarah Chen: Thanks. And the PRD?

[08:04] David Kim: Right, I'll get the PRD finalized this week. I've got a draft in Notion already — it's like 70% done. I'll share the link in #smart-notifications after this meeting. Please comment on it, especially the priority rules section. I took a first pass at which notification types should be which priority, but I need input from everyone.

[08:19] Priya Patel: Will do.

[08:21] Sarah Chen: Okay, before I forget — Marcus, what's the deal with our email sending infrastructure? Can it handle digest emails at scale, or do we need to look at that?

[08:29] Marcus Johnson: Uh, good question. We're on SendGrid right now, and we're nowhere near our rate limits for transactional emails. But digest emails are different from transactional emails — they're more like marketing-style batched sends. Like, at 9 AM Eastern, we might be sending thousands of digest emails simultaneously. I'd want to double-check our plan supports that kind of burst and maybe set up a dedicated sending domain, because you don't want your digest emails affecting the deliverability of your transactional emails. If digest emails start getting spam-flagged, it could drag down our reputation for password reset emails and stuff.

[08:56] Sarah Chen: That sounds important. Can you add that to your investigation? Just confirm SendGrid can handle it or if we need to think about alternatives.

[09:02] Marcus Johnson: Yeah, I'll include it in the design doc. I'll check our current plan limits and whether we need to set up a subdomain for digest sends. Probably something like digest.meridian.io or whatever.

[09:11] David Kim: While we're on the topic of email — we should make sure the digest email actually looks good on mobile. Like, over 60% of email opens are on mobile now.

[09:18] Lisa Torres: Oh absolutely. Responsive email design is its own circle of hell, but I'll make sure the template is mobile-friendly. I've got a good Figma plugin for testing email layouts across devices.

[09:27] David Kim: Great. Okay, what about analytics? We should be tracking whether this feature actually reduces notification fatigue. Like, are people engaging more with the notifications they do see?

[09:36] Sarah Chen: Good call. What metrics are you thinking?

[09:39] David Kim: Off the top of my head — notification open rate, or I guess "interaction rate" since in-app notifications aren't really opened per se. Digest email click-through rate. Percentage of users who enable digest mode over time. Maybe the ratio of notifications that get acted on versus ignored. And, um, possibly something like "time to act on notification" — like, does a critical notification get responded to faster now that it's not buried in noise?

[10:01] Marcus Johnson: That last one is interesting but might be hard to measure. What counts as "acted on"?

[10:05] David Kim: Yeah, you're right, that one's fuzzy. I'll flesh it all out in the PRD. We can debate what's actually measurable.

[10:10] Priya Patel: We'd need to add some tracking events on the frontend for all of this. I can spec those out once the PRD is done. We're using Mixpanel, right? Or did we switch to Amplitude?

[10:18] Marcus Johnson: We're still on Mixpanel. There was talk about switching but it never happened.

[10:22] Priya Patel: Okay, Mixpanel then. I'll define the event schema as part of my frontend estimate.

[10:27] David Kim: Perfect.

[10:29] Lisa Torres: Oh, one more thing — the digest email template itself. I want to make sure it's actually useful and not just a wall of text listing every notification. I'm thinking grouped by project, with the most important stuff at the top. Maybe a little summary line at the top that says something like "You have 3 items needing your attention and 12 updates."

[10:45] Marcus Johnson: That's cool. The "items needing your attention" part — that ties directly into the priority engine. We'd surface the high-priority stuff as action-needed and the rest as informational. So the digest becomes like a daily briefing rather than a recap.

[10:56] Priya Patel: Are we doing both daily and weekly digest options? Or just daily?

[11:00] David Kim: I was thinking daily and twice-daily — like morning and evening. Weekly seems too infrequent. You'd miss time-sensitive stuff.

[11:07] Marcus Johnson: Yeah, weekly doesn't make sense for a project management tool. If a task is due Thursday, you don't want to hear about it in Monday's weekly digest.

[11:13] Lisa Torres: Agreed. I'll mock up the daily and twice-daily flows. For twice-daily, I'm thinking the user picks their two delivery times — like 9 AM and 5 PM or whatever.

[11:21] David Kim: That works. Okay, so — daily and twice-daily digest options. That's decision four.

[11:26] Sarah Chen: Got it. Okay, let's talk timeline. David, what's the target ship date?

[11:31] David Kim: So I've been talking with the sales team, and they've got a couple of enterprise prospects — ConvergeTech and I think one other — who specifically asked about notification controls during their demos. Ideally, we'd want to have V1 out by end of April. Is that realistic?

[11:45] Sarah Chen: Hmm. That's about seven weeks from now. Let's think about this. Marcus, how long do you think the backend work is?

[11:52] Marcus Johnson: If we keep the scope to what we discussed — rules-based priority engine, notification queue for digest batching, quiet hours, and the digest email sending — I'd say three to four weeks of dev time. Plus probably a week for testing, edge cases, and integration with the frontend. So four to five weeks total.

[12:07] Sarah Chen: Priya?

[12:08] Priya Patel: Frontend-wise, probably two to three weeks? Depends on how complex the preferences UI ends up being. The settings page, the notification center updates, the Mixpanel events — it adds up. But a lot of that can happen in parallel with Marcus's work. I just need the API contracts defined early.

[12:22] Marcus Johnson: I can have the API contracts in the design doc by Friday. You won't need to wait for the implementation.

[12:27] Priya Patel: Perfect, that helps a lot.

[12:29] Lisa Torres: Design-wise, I'm mostly done with the wireframes. I need maybe another week to finalize everything into high-fidelity mocks and do the digest email responsive testing. I can have it all done by next Friday.

[12:39] Sarah Chen: Okay, so it's tight but doable. Let's say we aim for April 25th as the target, with the last week being a buffer slash bug bash. That means engineering needs to start by — what, March 24th at the latest?

[12:51] David Kim: That works. The PRD will be ready well before that. End of this week, hopefully.

[12:55] Sarah Chen: Alright. One last thing — QA. We don't have a dedicated QA person on this, so we're going to need to be disciplined about testing as we go. Marcus, Priya, can you both make sure you're writing tests? And let's plan for a team bug bash the week of April 21st, before launch.

[13:08] Marcus Johnson: Yeah, absolutely. I'll make sure the notification pipeline has good integration test coverage. The batching logic especially — that's where the bugs will hide. Time zone edge cases and all that.

[13:17] Priya Patel: Same on frontend. I'll use Cypress for the preferences flows and the notification center. I've been meaning to set up better E2E tests anyway.

[13:24] David Kim: And I can recruit a couple of people from the CS team to do user acceptance testing too. They know the notification pain points better than anyone — they hear about it every day.

[13:32] Sarah Chen: Love it. Okay, so before we wrap up — let me make sure we're aligned on action items. I'm going to go around. David, you're finalizing the PRD this week, sharing it in #smart-notifications, including a proposed notification priority defaults table.

[13:45] David Kim: Yep. End of week.

[13:47] Sarah Chen: Marcus, technical design doc by Friday, covering the notification pipeline, digest queue architecture, digest scheduling, and SendGrid capacity check.

[13:55] Marcus Johnson: Got it. I'll also include the API contracts so Priya can start frontend work.

[13:59] Sarah Chen: Great. Priya, frontend estimate by Thursday based on Lisa's Figma mocks. And the Mixpanel event schema.

[14:06] Priya Patel: Will do.

[14:07] Sarah Chen: Lisa, refined mocks — high fidelity — and the digest email template by next Friday. Including mobile responsive.

[14:14] Lisa Torres: Yep, on it. I'll also do the contextual nudge design in case we have time for the stretch goal.

[14:19] Sarah Chen: Bonus points. And David, you mentioned recruiting CS team members for UAT — can you line that up so they're ready when we need them in mid-April?

[14:26] David Kim: I'll reach out to Jen on the CS team this week. She'll know who the best testers are.

[14:31] Sarah Chen: Great. I think the open questions we still need to resolve are — one, do we need a separate sending domain for digest emails, which Marcus will figure out. Two, what exactly is the right set of default notification priority rules? David's taking a first pass in the PRD. And three — this one just occurred to me — do we need to handle the case where a digest is about to send but the user already saw the notifications in-app? Like, do we deduplicate?

[14:52] Marcus Johnson: Oh, that's a good one. Yeah, we should at least think about it. Sending someone a digest full of stuff they already saw is kind of annoying. I'll add that to the design doc.

[14:59] David Kim: Yeah, maybe the digest only includes things the user hasn't interacted with? That would make it way more useful.

[15:04] Sarah Chen: Exactly. Let's figure that out in the design review Monday. Okay, I think we're good. Thanks everyone. Let's make this happen.

[15:10] Marcus Johnson: Sounds good.

[15:11] Priya Patel: Thanks!

[15:12] Lisa Torres: See you all Monday.

[15:13] David Kim: Later, everyone.

[15:14] Sarah Chen: Oh wait — one more thing. Can everyone react to David's PRD doc with comments by Monday morning so we can discuss feedback at the architecture sync? I don't want to do a cold read in the meeting.

[15:22] Marcus Johnson: Sure thing.

[15:23] Priya Patel: Will do.

[15:24] Sarah Chen: Okay, now we're done for real. Bye!
