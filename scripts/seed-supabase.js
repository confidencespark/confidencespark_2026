/**
 * Seed Supabase with Confidence App content from PDF spec.
 *
 * Run: node scripts/seed-supabase.js
 * Requires: .env with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * The service role key bypasses RLS for initial seed.
 * Install dotenv if needed: npm install dotenv
 */
try {
  require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});
} catch {
  // dotenv optional; use env vars directly
}
const {createClient} = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SITUATIONS = [
  {key: 'daily', title: 'Daily Boost', subtitle: "You're not here to impress. You're here to connect.", sort_order: 0},
  {key: 'pitch', title: 'Pitch', subtitle: "You're not asking, you're offering.", sort_order: 1},
  {key: 'interview', title: 'Interview', subtitle: "You're not here to impress. You're here to connect.", sort_order: 2},
  {key: 'interview_career', title: 'Interview / Career Transition', subtitle: 'Steady feels strong. Relaxed feels confident.', sort_order: 3},
  {key: 'performance', title: 'High Pressure Moments', subtitle: 'Let go. Lock in. Light it up.', sort_order: 4},
  {key: 'negotiation', title: 'Negotiation', subtitle: 'Hold the line. Speak your worth.', sort_order: 5},
  {key: 'presentation', title: 'Presentation', subtitle: 'Your voice matters, make it heard.', sort_order: 6},
  {key: 'difficult', title: 'Difficult Conversations', subtitle: 'Meet it with steadiness, clarity, and respect.', sort_order: 7},
];

const VIBES = [
  {key: 'any', title: 'Any', sort_order: 0},
  {key: 'calm', title: 'Calm & Grounded', sort_order: 1},
  {key: 'power', title: 'Pumped & Powerful', sort_order: 2},
  {key: 'playful', title: 'Playful & Loose', sort_order: 3},
];

// Kit content from PDF - situation_key, vibe_key, kit_name, body_reset, grounding_belief, mental_reframe, ending_ritual, mantra, bonus_tip, voice_audio_url
const KITS = [
  ['daily', 'any', 'Daily Dose',
    `1. Stand tall, feet planted evenly. Let your shoulders rest strong and open.
2. Inhale through your nose for 4. Exhale through your mouth for 6.
3. Notice your heartbeat and breath syncing.
4. Roll your shoulders once. Lift your gaze slightly.
5. Let your breath settle. Notice how your body knows what to do next. Your body is ready to speak.`,
    `Confidence grows every time you speak. In this moment, you're allowed to rely on what you've already built. You're here to speak from clarity, experience, and alignment. Let that land—confidence is something you stand in, not something you perform.`,
    `Confidence is clarity in motion. This sensation means I'm ready to act. As my body energizes, my focus sharpens. My next step feels clear and available. I move forward with calm direction. Confidence builds as I act.`,
    `Pause for a moment. Take one slow, easy breath. Let your shoulders settle. Feel your feet supported beneath you. Allow your gaze to soften. Notice the feeling of being here. Ready. Present.`,
    `Shift into focus. I am calm. I am relaxed. I see my goal clearly. I hear my voice steady and sure. I feel the power in this moment: focused, alive, and prepared.`,
    `Confidence is a muscle. Every time you walk through a doorway today, say your power statement. Each doorway is a micro rep of confidence. You're not waiting to feel it, you're building it.`,
    null],
  ['pitch', 'calm', 'Present, Not Performing',
    `1. Ground your feet, feel steady and strong on both legs. Imagine your spine rise tall and your shoulders relax.
2. Breathe in through your nose for 5 counts, hold for 2, then exhale slowly through your mouth for 6. Repeat 3 times.
3. As you breathe, notice your heart rate slowing, your body matching, following your focus.
4. Bring to mind a listener in front of you. Notice their face, their eyes, their attention.
5. Let your breath stay steady as you imagine your words landing.`,
    `This pitch is about creating understanding. Your calm confidence already reflects your value. Feel your feet anchored beneath you. Picture the room open to connection, faces attentive, energy receptive.`,
    `You are sharing value. Your calm presence helps people listen and understand. Take one slow breath and let your attention rest on the people in front of you, not on yourself.`,
    `Take one slow breath in. Exhale gently. Feel your feet steady beneath you. Let your shoulders rest. Pause here. You're settled and ready.`,
    `I breathe, I soften, and I shift my focus to the people in front of me. I see people, ready to learn, and I speak with clarity.`,
    `Rehearse your pitch, then show up like it's a conversation. People remember how they feel with you more than what you say.`,
    null],
  ['pitch', 'power', 'Command the Room',
    `1. Stand tall, feet slightly wider than your hips. Let your shoulders open and your chest lift naturally.
2. Take one steady inhale through your nose… Exhale through your mouth. Feel your posture support you.
3. Shake out your arms and hands once. Let your body wake up and come online.
4. Smile lightly and say your opening line out loud. Hear your voice land clear and strong.
5. Pause. Notice the feeling: energized, steady, ready.`,
    `You lead with purpose. This pitch is about solving a problem that genuinely matters. Feel your feet grounded beneath you. Picture the people this solution helps. Take one slow inhale, one long exhale. Say quietly: "This matters."`,
    `You're here to show how you win together. You're presenting an opportunity that creates shared value. That grounded sensation signals partnership. Entering as a collaborator sets the tone for the room.`,
    `Stand tall. Feel your chest open. Take one strong inhale. Exhale with control. Still for a beat. Energy gathered. Ready to move.`,
    `I lead with confidence. I close deals through trust, presence, and clarity. I have powerful presence. My confident delivery lands every time.`,
    `Pausing after a key point signals confidence and gives your words room to land. Try this: after your next line, wait half a second longer than usual.`,
    null],
  ['pitch', 'playful', 'Pitch, Please',
    `1. Gently move your arms, hands, and legs, light, loose, rhythmic. Feel warmth and aliveness spread as your body wakes up.
2. Say your opening line once in an exaggerated, playful voice, bigger, freer.
3. Let a natural smile form. Feel the softness around your eyes and jaw as ease settles in.
4. Allow a short laugh or breathy chuckle. Notice the lift in your chest.
5. Move for a few seconds, sway, bounce, nod. You're expressing. You're awake. This is your spark.`,
    `You're here to connect and that's where your power lives. That calm, grounded presence is what people trust. When you lead with connection, confidence follows naturally.`,
    `Pitching is storytelling, with numbers supporting the story. When you enjoy sharing it, people enjoy receiving it. Ease carries attention. Presence carries meaning.`,
    `Soften your stance. Let a small smile appear. Take one easy breath. Exhale lightly. Pause. Loose, present, ready.`,
    `I share with ease and energy. My story flows naturally. People lean in.`,
    `Your message lands best when you let it be fun. Joy allows authority to land with warmth and ease.`,
    null],
  ['interview', 'calm', 'Anchor In',
    `1. Place a hand over your heart. Feel the steady rhythm there, alive, responsive, ready.
2. Let that rhythm remind you: this is energy supporting you.
3. Stay with that sensation for a few seconds. Notice your breath easing and your body settling into balance.
4. When you speak, lead from this place. Calm presence carries power and it's already online.`,
    `An interview is a space to share the value you already bring. You enter as an equal, grounded, capable, ready to contribute. Notice this feeling of readiness—familiar, calm, available.`,
    `This is a two-way conversation. You're here to explore alignment together. Notice how calm presence naturally builds credibility. Your voice settles, smooth, unhurried, assured.`,
    `Feel both feet on the floor. Take one slow breath in… and out. Let your shoulders settle. Pause. Move forward from here.`,
    `I arrive grounded and ready. My experience supports me as I speak. I answer with clarity and authority.`,
    `Smile when you first make eye contact. That single cue makes the other person more receptive. Connection starts faster than words.`,
    null],
  ['interview', 'power', 'Let Them See You',
    `1. Stand with your feet rooted beneath you, spine tall, shoulders open. Let your stance signal: I belong here.
2. Choose one strength and say it out loud: "I'm composed under pressure." / "I speak with clarity and conviction." / "I make people feel confident."
3. Close your eyes briefly and picture the interview unfolding with ease.
4. Open your eyes. Your body recognizes this readiness. Step forward carrying it with you.`,
    `This sensation in your body is good energy. The kind that shows up when something matters and you're ready to enjoy it. Say softly: "This is energy. This is readiness. This is me stepping in."`,
    `They're drawn to presence and passion. Your energy is what makes you memorable. Calm carries intensity with precision. As you settle into readiness, your voice deepens, your timing smooths.`,
    `Stand tall and still. Take one steady breath in. Feel strength collected, not rushed. Hold for a beat. Step in.`,
    `I show up curious, warm, and at ease. Conversation flows naturally here. Connection comes easily.`,
    `Channel past wins. Recall a moment when you felt fully capable. Press your thumb and forefinger together. Any time you repeat this cue, your body knows what to do.`,
    null],
  ['interview', 'playful', 'Flow Into It',
    `1. Take a slow, steady breath in through your nose. Feel it expand gently through your chest, ribs, and belly.
2. As you exhale, roll your shoulders up, back, and down in one smooth circle.
3. Lightly shake out your arms, letting sensation move through your hands and fingertips.
4. Finish with one comfortable exhale and allow a soft smile to form.
5. Let your body register this state: calm, ready, and naturally in control.`,
    `Your best performance happens when you're fully present. Calm focus gives your words and actions natural impact. This is where impact emerges—from steady awareness and embodied presence.`,
    `Feel your heartbeat. Notice its steady, supportive rhythm. That sensation is activation. Take a gentle breath in. Feel clarity spread. Exhale slowly. You're ready.`,
    `Let your shoulders loosen. Take one light, comfortable breath. Let your face soften. Small pause. Speak.`,
    `I stay open and expressive. My energy flows naturally. I enjoy being here.`,
    `That surge in your body is readiness. It's energy coming online to support focus and clarity. Use the energy. Let it carry you forward.`,
    null],
  ['interview_career', 'calm', 'Centered Stage',
    `1. Place one hand on your chest and one on your belly. Feel the gentle rise and fall beneath your palms.
2. Inhale softly through your nose for 4 counts. Exhale through your mouth for 6. Repeat two more times.
3. Ground your feet. Press them evenly into the floor.
4. As you finish, quietly think or whisper: "Calm in… strength out."
5. Let that rhythm settle into your body. Calm and strength moving together, balanced, steady, ready.`,
    `This conversation is a meeting of equals. You're here to explore alignment, clarity, and shared possibility. Your presence and authenticity communicate value. Picture a thoughtful question arriving. Hear yourself respond steady, warm, and clear.`,
    `Let your attention settle right here. Take a slow breath in, and as you exhale, feel your shoulders settle into ease. Picture this moment as it is: clear, stable, open. This is presence. And presence carries strength.`,
    `Pause. Let your feet feel the floor beneath you. Take one slow breath in… and a longer breath out. Still your body. Let everything settle. Begin when you're ready.`,
    `I am steady and present. My focus is clear. I perform with calm confidence.`,
    `Stay here for a few extra seconds. Take a slow breath in, and as you exhale, let the corners of your mouth lift. That small smile signals ease in your body and warmth in the room.`,
    null],
  ['interview_career', 'power', 'Stage Energy',
    `1. Stand tall, feet wide, chest naturally lifted, chin level. Feel the ground supporting you.
2. Take a quick inhale through your nose for 3, then a clear exhale through your mouth for 3. Repeat three times.
3. Shake it out lightly, arms loose, shoulders easy, a gentle bounce in your knees.
4. Snap or clap once, crisp and intentional. Say silently or aloud: "I bring energy. I bring clarity. I'm ready."
5. Feel how your body responds. That's your activation cue. You're on.`,
    `This moment brings out your best. This stage is your platform to lead with strength and clarity. Feel energy moving through you, steady, available, supportive. Ready strength. Calm command.`,
    `Confidence comes from knowing your value. Take a slow, easy breath and notice the quiet space in your body where certainty lives. This is steady confidence—clear, centered, and self-anchored.`,
    `Stand tall. Take one strong breath in through your nose… release it through your mouth. Feel your posture lock in, steady, upright, ready. Go.`,
    `I bring energy and command. My presence leads. I perform with strength and clarity.`,
    `When you notice your heart rate lift or energy build, quietly label it: excitement. That single word guides your brain into readiness.`,
    null],
  ['interview_career', 'playful', 'Let It Rip',
    `1. Let your arms loosen and gently shake them out. Sway your torso side to side, easy and rhythmic.
2. Take a smooth inhale through your nose. Exhale through your mouth with a light, natural smile.
3. Snap your fingers or tap your leg once. Think quietly: "Relaxed and ready. I connect with ease."
4. Feel that rhythm travel through you—calm in your chest, lightness in your shoulders, confidence in your stance.
5. This is connection in motion, easy, confident, and already happening.`,
    `Your message lands best when you let it be fun. You're here to express, explore, and share. Your breath smooths. Your attention lightens. Your voice finds its natural, conversational rhythm. This is your flow state.`,
    `You're here to connect and connection naturally brings leadership forward. When you lead from connection, confidence flows without effort. The room responds to authenticity and clarity.`,
    `Soften your shoulders. Take one relaxed breath out. Feel lightness through your arms and hands. Pause and take in the space around you. Step forward with ease.`,
    `I stay open and curious. The exchange feels easy and fluid. Good options emerge naturally.`,
    `Picture your message landing like a spark—curious eyes, softened shoulders, quiet laughter. Lightness lowers tension, deepens connection.`,
    null],
  ['performance', 'calm', 'Hold the Line',
    `1. Place both feet flat on the ground. Feel them press evenly into the floor, solid, steady, supported.
2. Rest one hand lightly on the table or in your lap. Inhale through your nose for 4… Exhale through your mouth for 6. Repeat once more.
3. As you breathe, silently repeat with the rhythm: "Calm is my advantage."
4. Let the words settle into your body. Notice how calm feels active, grounded, available.
5. This is steadiness with direction. This is composure you can use.`,
    `Stay here for a moment. Inhale slowly through your nose. Exhale even slower through your mouth. When you pause before responding, clarity naturally rises. Your calm invites trust. Stillness is composure made visible.`,
    `You create leverage by showing value and guiding the conversation with clarity. Leadership grows naturally when you stay composed and intentional. Each calm word builds credibility.`,
    `Feel both feet press evenly into the floor. Take one slow breath out. Let your shoulders rest where they are. Pause here for a beat. Move forward from this steadiness.`,
    `I stay steady and clear. I listen fully and respond with confidence. The conversation moves forward.`,
    `Keep a post-it that says "Pause." When the moment gets charged, use it. Pause before you respond. That brief stillness gives you information.`,
    null],
  ['performance', 'power', "Know Your Worth",
    `1. Stand tall. Let your spine lengthen, shoulders open, eyes forward. Feel the ground supporting each foot.
2. Take ten slow, intentional steps. With each step, notice calm strength settling in.
3. Say your ask out loud. Let your voice carry certainty and ease.
4. Pause for a breath. Feel how strength lives in your body.
5. If it feels clear and powerful here, it moves with you into the room.`,
    `Negotiation is leadership in action. You bring power to the table. Power is knowing your value before anyone else names it. Your steadiness sets the tone before you speak. This is executive presence.`,
    `They're here for energy and conviction. Your passion is what makes you memorable. Notice the gentle warmth spreading through your chest—your nervous system switching into readiness. This is harnessed energy.`,
    `Stand or sit tall. Take one full inhale, then a strong, controlled exhale. Feel your spine long and your chest open. Hold still for one second. Carry this strength with you.`,
    `I bring clarity and direction. My presence shapes the conversation. I negotiate with calm strength.`,
    `"You don't get what you deserve, you get what you negotiate." — Chester L. Karrass`,
    null],
  ['performance', 'playful', "Let's Dance",
    `1. Roll your shoulders back in two slow, full circles, smooth and unhurried.
2. Wiggle your fingers and softly shake your wrists, light and fluid.
3. Take a deep inhale through your nose, steady and full. Exhale through your mouth with a soft, natural smile.
4. Notice how that smile settles you into balance, composed, clear, and ready.`,
    `Negotiation is collaboration. You're here to build something with someone. When you stay flexible, new options appear. That's where the fun starts. This is mental agility—staying light on your feet while staying clear on your goals.`,
    `The best outcomes unfold through curiosity. When you stay open, more options appear. Ease your pace for a moment. Curiosity guides the conversation forward—calm, confident, and full of possibility.`,
    `Let your shoulders roll once. Take a relaxed breath out. Feel lightness through your arms and hands. Pause and take in the space around you. Step forward with ease.`,
    `I stay curious and open. The exchange feels easy and fluid. Good options emerge naturally.`,
    `Use questions as tools. A well-timed question keeps the conversation moving and gives you space to think with ease. Curiosity creates connection. Connection creates momentum.`,
    null],
  ['negotiation', 'calm', 'Speak from Center',
    `1. Place one hand gently over your heart. Feel the steady rhythm beneath your palm, warm, consistent, alive.
2. Let that rhythm remind you: readiness is already present. You're noticing confidence.
3. Stay here for a few quiet moments. Feel that calm pulse travel through your chest, down your arms, into your hands.
4. Let your words rise from that rhythm, measured, grounded, assured.
5. Confidence is already moving with you.`,
    `Focus on sharing your message with the room. Sense the openness, attentive faces, relaxed posture, quiet curiosity. Speak to that energy. When you connect with the room's willingness to listen, you're already succeeding.`,
    `I am steady and present. My message is clear. I speak with calm confidence.`,
    `Let your feet press gently into the ground. Take one slow, easy breath. Pause with a soft, steady gaze. Stay here for a beat. You're settled and ready to speak.`,
    `Presence is what creates impact. Let your focus widen. Let your presence deepen. Connection spreads through resonance, and it starts with you.`,
    `Use silence on purpose. After a key point, pause. Let the room settle around your words. That brief stillness holds attention and gives your presence space to lead.`,
    null],
  ['negotiation', 'power', 'Own the Mic',
    `1. Step into your power stance. Feet wide. Spine tall. Chest open. Feel your body settle evenly as you claim the space.
2. Shake out your hands. Loosen your fingers. Let small flicks wake up your focus.
3. Lift your arms into a winner pose. Elbows high. Chin level.
4. Hold the pose for a few seconds and smile. Let the smile seal it in.
5. Energy activated. Focus clear. Presence online.`,
    `This stage brings out your best. You're here to energize, inspire, and lead. Widen your stance just a touch. Feel your feet press firmly into the ground. Your body knows this moment. You've done the work. Now your presence sets the tone.`,
    `I bring energy and conviction. My presence holds the room. My message lands with impact.`,
    `Let your shoulders drop just a little. Take one light, natural breath. Pause with relaxed focus. Notice the ease. You're ready to engage.`,
    `They want you to do well. Curiosity and ease naturally draw people toward you. The room is open to you. Ease carries confidence.`,
    `Slow your start. Take one full breath. Lift your eyes and meet the room. Begin on your timing. That brief pause sets the rhythm. Composure leads.`,
    null],
  ['negotiation', 'playful', 'Speak Easy',
    `1. Take two slow, natural steps in place, as if you're already walking into the room with ease.
2. Let your body sway gently side to side for about five seconds. Loosen your shoulders, unlock your knees.
3. Take one deep inhale through your nose. Exhale through your mouth with a soft "haaa," letting the sound carry any leftover tension out.
4. Feel that calm energy return, centered, open, and ready to move forward.`,
    `You are here to connect and contribute. This moment is about sharing something that genuinely helps. Speak from joy. Speak to help. That's where your influence lives. When you give value, it shows, effortlessly.`,
    `I enjoy sharing my message. My energy is open and engaging. Connection flows easily.`,
    `Let your feet press gently into the ground. Take one slow, easy breath. Pause with a soft, steady gaze. You're settled and ready to share.`,
    `Feel that buzz? That's your system switching on. Smile and quietly say, "I'm excited." What you're feeling is activation—focus sharpening, oxygen flowing, attention coming online. This energy works for you.`,
    `Before you begin, remind yourself: "I'm sharing a story." "The most powerful person in the world is the storyteller." — Steve Jobs`,
    null],
  ['presentation', 'calm', 'Steady First',
    `1. Place both feet flat on the floor. Press them down gently and feel the support underneath you.
2. Inhale through your nose for 4. Exhale through your mouth for 6. Repeat once more, slow and even.
3. Let your shoulders drop a half inch. Unclench your jaw. Feel your hands rest heavy and relaxed.
4. Let your gaze soften and widen slightly.
5. Feel your body settle into calm readiness. Your system is steady enough to listen and respond.`,
    `This conversation matters. I meet it with steadiness, clarity, and respect. I'm here to understand and to be understood. My calm supports progress and keeps the exchange productive. I listen with intention and respond with care.`,
    `This conversation is a space for clarity and respect. I can meet it with steadiness and care. Feel your feet supported beneath you. Notice your breath moving evenly, smooth and reliable. Steady presence guides this exchange.`,
    `Pause. Let your feet feel the floor beneath you. Take one slow breath in… and a longer breath out. Still your body. Let everything settle. Begin when you're ready.`,
    `I stay steady and clear. I speak with calm presence. The conversation moves forward.`,
    `Slow the moment down on purpose. Before you respond, take one quiet breath and feel your feet connect with the floor. Let your voice match that pace, steady and even. Calm is how understanding stays possible.`,
    null],
  ['presentation', 'power', 'Clear and Firm',
    `1. Stand or sit tall. Press your feet firmly into the floor and feel strength rise through your legs.
2. Inhale through your nose for 3. Exhale through your mouth for 4. Do this twice, alert.
3. Roll your shoulders back once. Lift your chest slightly. Feel your core activate.
4. Lift your gaze to eye level.
5. Feel energy collect in your center, strong, controlled, ready. Your body is prepared to speak clearly and hold the line.`,
    `This conversation is a moment to lead with clarity and strength. You're here to move things forward. Feel your spine tall and your chest open. That posture signals confidence and capability. Your breath is steady. Your voice is clear. You bring direction. You bring solutions.`,
    `This conversation matters and I am ready for it. I bring clarity, strength, and direction. Feel your posture rise naturally. I speak with intention. I hold the tone of the room through presence. This is composed power in action.`,
    `Stand tall. Take one strong breath in through your nose… release it through your mouth. Feel your posture lock in, steady, upright, ready. Go.`,
    `I bring clarity and strength. My voice holds the space. I lead this conversation.`,
    `Anchor your authority before you speak. Sit or stand tall and feel your spine lengthen. Let your breath fill your chest once. Then speak from that posture. Strong conversations come from grounded certainty.`,
    null],
  ['presentation', 'playful', 'Soft Tone, Strong Message',
    `1. Gently shake out your hands and wrists for a few seconds. Let your shoulders move freely.
2. Take a comfortable inhale. Exhale with a light sigh through your mouth. Repeat once.
3. Let a small smile form, just enough to relax your face. Feel ease around your eyes and jaw.
4. Shift your weight gently side to side once or twice.
5. Feel your body stay loose and responsive. Your nervous system is open enough to stay curious and adaptive.`,
    `This conversation is an opportunity to explore and understand together. I can meet it with curiosity, openness, and ease. I don't have to have everything figured out right now. I can stay flexible and responsive as the conversation unfolds. Imagine listening with interest, speaking with warmth. My body stays loose and my mind stays sharp.`,
    `This conversation is an opportunity to explore. Curiosity keeps me flexible and sharp. Notice a lightness in your shoulders. Feel your breath stay easy and open. I respond with warmth and interest. Ease creates connection.`,
    `Gently roll your shoulders once. Take a relaxed breath in, easy breath out. Let a small smile land and stay. Pause. Ready to share.`,
    `I stay open and curious. Ease keeps the conversation flowing. New understanding emerges.`,
    `Lead with curiosity. Let a small smile soften your face or warm your tone before you answer. That ease keeps the conversation human and opens more options. Curiosity + warmth = flexibility.`,
    null],
];

// Audio URLs - direct download format for mobile playback (from PDF VoiceAudioURL column 0-15)
const AUDIO_FILE_IDS = [
  '1RM2s4fBz7ujOed4c5cpej_-F8UZYIlTn', '1H09KaOi4kxYKWFi-YH7wV_FQCUPt_AXR',
  '1e5E_iaI6rgOsjkqGdv-cEJr6jk7vsi6a', '1xoqnyRRP0JDD40ZynPfS2KqqR54P4fwx',
  '1ETrtCNjGhKx6oa0efHd7-cmhWkQo1dWu', '1pK5QxlXLyiMYdlNWK4GJ6TTHad8oSWg0',
  '19Oyaj0JrN0geV9IYvZImpmfcAa_0rs3e', '19GsM3RmaoM2dHrLZbU6V9Ptqxe7Bky_g',
  '1d1uQPha27TfH0ZuPTzkYupdWPwvveR0E', '1VbFA1ZPmLBa6BKjj7ytN8rxUYjuVZdjc',
  '10QpcGfccPoTm-AIGhCdpWAaG4b2nGxI4', '1v6pe4EDKwEBfD0jiRES6wllTf2fcPxQn',
  '1v5xfD2vFrT-8XtiPza2_cMptyGHFjAXu', '19ZWONlFnVcPFlsMJmn24noXPqefysfpN',
  '12Uya9bR1O1HZJwuKgXgtZY83i-zPgbtf', '1b_jU6LnIUdr59ZSd3nkI2MAD18rAoU-Z',
];
const toDirectUrl = id => `https://drive.google.com/uc?export=download&id=${id}`;
const AUDIO_URLS = AUDIO_FILE_IDS.map(toDirectUrl);

async function run() {
  console.log('Seeding Supabase...');

  const situationIds = {};
  const vibeIds = {};

  for (const s of SITUATIONS) {
    const {data, error} = await supabase.from('situations').upsert(s, {onConflict: 'key'}).select('id, key').single();
    if (error) {
      const {data: inserted} = await supabase.from('situations').insert(s).select('id, key').single();
      if (inserted) situationIds[inserted.key] = inserted.id;
      else console.warn('Situation', s.key, error.message);
    } else {
      situationIds[data.key] = data.id;
    }
  }
  console.log('Situations:', Object.keys(situationIds).length);

  for (const v of VIBES) {
    const {data, error} = await supabase.from('vibes').upsert(v, {onConflict: 'key'}).select('id, key').single();
    if (error) {
      const {data: inserted} = await supabase.from('vibes').insert(v).select('id, key').single();
      if (inserted) vibeIds[inserted.key] = inserted.id;
      else console.warn('Vibe', v.key, error.message);
    } else {
      vibeIds[data.key] = data.id;
    }
  }
  console.log('Vibes:', Object.keys(vibeIds).length);

  for (let i = 0; i < KITS.length; i++) {
    const [sitKey, vibeKey, kitName, body, ground, mental, ritual, mantra, bonus, _] = KITS[i];
    const sid = situationIds[sitKey];
    const vid = vibeIds[vibeKey];
    const audioUrl = AUDIO_URLS[i] || null;
    if (!sid || !vid) {
      console.warn('Skip kit', kitName, '- missing situation or vibe');
      continue;
    }
    const kit = {
      situation_id: sid,
      vibe_id: vid,
      kit_name: kitName,
      body_reset: body,
      grounding_belief: ground,
      mental_reframe: mental,
      ending_ritual: ritual,
      mantra: mantra,
      bonus_tip: bonus,
      voice_audio_url: audioUrl,
    };
    const {error} = await supabase.from('kits').upsert(kit, {onConflict: 'situation_id,vibe_id'});
    if (error) console.warn('Kit', kitName, error.message);
  }
  console.log('Kits:', KITS.length);
  console.log('Done.');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
// ConfidenceSpark workspace batch
