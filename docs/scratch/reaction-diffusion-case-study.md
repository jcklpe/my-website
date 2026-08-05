# Mini Case Study: The Reaction-Diffusion Background
Raw notes for a possible write-up. Plain language on purpose — no simulation background assumed.

## What it is
The homepage has a faint pale-blue pattern drifting behind everything, like coral or fingerprint ridges. It is not a video or an image. It is a tiny simulation running in the browser, recomputed every frame.

The maths behind it is **Gray-Scott reaction-diffusion**, a model of two imaginary chemicals in a dish. Call them the *feed* and the *grower*. The grower consumes the feed to make more of itself, both spread out slowly, and the grower gradually dies off. Those three rules alone — no drawing instructions, no artist's hand — settle into the branching, maze-like shapes that show up on seashells, animal coats, and fingerprints. Alan Turing proposed the idea in 1952 to explain how a featureless embryo develops stripes and spots. The patterns are still called **Turing patterns**.

A few terms used below:
- **Feed / kill rates** — the two dials that decide which pattern you get. Small changes flip it between spots, stripes, mazes, and branching coral. Most combinations produce nothing at all.
- **The field** — the grid of numbers being simulated, one cell per small square of screen.
- **Nucleation** — dropping a seed of the grower somewhere so a new patch can start.

## Why it was hard
It looked wrong for about a week, and every wrong theory was plausible. The useful part of the story is the wrong turns.

**The pattern kept coming out as diagonal streaks — a "wind-blown" look — instead of coral.** The cause turned out to be the seeding. To keep the pattern alive, the code sprinkled fresh seeds using a random-looking formula, and shifted that formula by one cell each step so different cells were picked over time. But shifting by one cell each step means *the cell next door fires next* — so every seed point was quietly drawing a diagonal line across the screen, hundreds of times a second. It was not a rendering artifact. It was a pen.

**Then removing the seeding killed the pattern entirely.** Which revealed the real problem: the reaction was never self-sustaining. It had been kept alive purely by that flood of seeds, and once the life support was removed, everything faded within seconds. Every earlier fix had been treating the paint, not the thing that was supposed to be growing.

**Two units bugs made everything else unreadable.** Decay and drift were applied *per simulation step* rather than per second, and the simulation runs about fifteen steps per frame — so those settings were silently about a thousand times stronger than they read, and changing the simulation speed also changed the look. Separately, an "advance" value grew without limit, and once it got large the maths lost precision and degraded on its own.

## What finally worked
**Stop debugging four things through one window.** The breakthrough was building a separate test page with switches: turn the pattern mask off, the drift off, the seeding off, and view the raw internals rather than the finished look. The decisive test took one click — with everything else disabled, does the reaction alone produce coral that lasts? It did. That single answer invalidated a week of theories and pointed straight at the seeding.

**Seeds cannot substitute for growth.** Every attempt to compensate for something by adding more seeds produced solid slabs instead of coral, because the pattern needs the gaps as much as the ridges. Past a low rate, seeding fills them in.

**Anything that biases a direction turns coral into stripes.** Making the pattern spread faster along one axis, or mature faster on one side, both read as bands rather than growth. The version that worked does not push the pattern at all — it simply makes *more ground fertile* in the direction you tilt, so the coral has more room to grow that way. Direction without a bias.

## The phone version
On a laptop the cursor pulls growth toward it. Phones have no cursor, so the phone reads device tilt instead.

The first attempt treated tilt as a *push*: lean the phone and the pattern accelerates that way. That is wrong in a way worth remembering — a push accumulates. Hold the phone still at any angle and it keeps speeding up forever, and since nobody holds a phone perfectly level, it never stopped. The fix came from an old parallax library still sitting in the repo from a previous site: treat tilt as a **position**, not a push. Lean the phone and the pattern shifts a limited distance and stays there; level off and it returns. That library also re-zeroes itself whenever the phone is moved to a genuinely new angle, so carrying it upright becomes the new "level" rather than a permanent lean.

Two extra wrinkles, both worth knowing if this is ever done again:
- **Near-vertical phones break the tilt maths.** The left-right tilt reading becomes wildly unstable when a phone is upright, so it jitters violently on the smallest movement. Reading the direction of gravity instead of the raw angles fixes it, because the unstable term naturally fades out exactly where it becomes unreliable.
- **Limiting how far is not limiting how fast.** The motion was capped in distance but not in speed, so a sharp tilt still sent the pattern racing — and fast movement is precisely what shears it into stripes.

## The thing I would tell someone starting this
Most of the lost time came from confident explanations of a system nobody could see inside. The fix was not a cleverer theory; it was a page with switches on it, built about a week too late. Build the switches first.
