# Mini Case Study: The Reaction-Diffusion Background
Raw notes for a possible write-up. Plain language on purpose — no maths or simulation background assumed.

## What is actually on the screen
Behind the homepage there is a faint pale-blue pattern, slowly drifting — something between coral, lichen, and a fingerprint. It is not an image or a video. Nothing about its shape was drawn by hand. It is a small simulation running live in the browser, recalculated many times a second, and it is different every time the page loads.

The system underneath is **Gray-Scott reaction-diffusion**, a model of two imaginary chemicals in a dish. Call them the *feed* and the *grower*. Three rules, that is all:

1. The grower consumes the feed to make more of itself.
2. Both spread outward slowly.
3. The grower gradually dies off.

From nothing but those rules, the dish organises itself into branching, maze-like structures. Nobody specifies a branch or a curve. The same idea was proposed by Alan Turing in 1952 to explain how a featureless embryo ends up with stripes and spots, and the resulting shapes are still called **Turing patterns** — they are a decent first-order explanation for seashell markings, leopard rosettes, and the ridges on your fingertips.

Two dials, **feed** and **kill**, decide which pattern you get: spots, worms, mazes, mitosis, or the branching coral used here. The territory is genuinely strange — nudge one dial by a couple of thousandths and coral becomes drifting dots, or dies out entirely. Most of the parameter space produces nothing at all.

## The art direction, and the controls built to serve it
Plain Gray-Scott left alone does something specific and not very useful for a website: it grows until it fills the entire screen, evenly, and then it freezes. Beautiful for about fifteen seconds, then it is wallpaper.

The brief was more particular than that — a *page-wide skin*, pale periwinkle, low contrast, at a large scale with low density, asymmetric, with wide open negative space, slowly oozing rather than busy, and semi-interactive. Nearly every control in the final piece exists because of one of those words.

**"Wide open negative space" → the fertility field.** A second, much smoother noise pattern is laid over the dish and decides where the reaction is even allowed to survive. Where it says fertile, coral grows; where it says barren, it dies. This is what stops the pattern from becoming an even wall of texture, and it is the single biggest reason the thing reads as composed rather than generated. Its two controls are *how much* of the screen is fertile, and *how large* the fertile regions are.

**"Slowly oozing, not static" → drift.** The fertility field slides very slowly across the screen. Coral dies where the ground turns barren behind it and grows into ground that has just turned fertile ahead. That is the whole sense of life in the piece: nothing about the reaction itself is restless, but the *ground it lives on* keeps moving. The reference image for this was time-lapse footage of slime mould spreading through agar and dying back as it meets chilli — growth and death happening at once in different places.

There is a hard limit here worth knowing, because it governs the aesthetic: **coral can only spread outward from coral that already exists**, at a fixed speed. Move the ground faster than growth can follow and the pattern gets stranded on barren land and wiped out. Every "make it more dynamic" instinct runs into this ceiling. Drift speed turned out to be *the* master control for the whole feel, and it is set low — a single blob of fertility takes about twelve seconds to travel its own width.

**"Not a conveyor belt" → wandering drift.** A fixed drift direction reads as a mechanism: everything sliding one way forever. The direction instead wanders continuously along a slow curve, so the field meanders.

**"Semi-interactive" → the cursor lowers the kill rate.** The obvious approach — paint reactant where the cursor is — was tried and rejected on sight: it looks exactly like what it is, paint being applied. What ships instead does not add anything. It makes the area under the cursor *more hospitable*, so coral that already exists grows toward it, and recedes when the cursor leaves. The difference is the difference between splashing paint and slime mould finding food, which was the note that drove it. That growth zone is also broken up by a drifting speckle, because a clean circle of "more hospitable" reads as a stamp.

**Legibility → a measured dead zone.** The wordmark sits over the pattern, so the sim reads the actual on-screen position of the two script words and treats that ellipse as slightly hostile ground. Coral thins out there rather than being cut out, and because it is measured live it follows the type across every breakpoint.

**Never open on a mess → a warm-up.** The reaction takes time to organise. The first several thousand steps run before anything is shown, behind a fade, so the page opens on a grown pattern instead of a field of dots.

## The phone version
Desktop has a cursor. Phones do not, so the phone reads **device tilt**, and the pattern responds to how you hold it.

Getting this to feel natural took the most iteration, and the useful part is *why* each attempt failed, because each failure was a lesson about what the aesthetic could tolerate:

- **Tilt moving a point around** worked in isolation but vanished in context — the coral is fragmented enough that a single moving point is invisible in it. Moving the *whole field* is legible; moving something *within* it is not.
- **Tilt as a push** (lean the phone, the pattern accelerates that way) is wrong in an instructive way: a push accumulates. Hold the phone still at any angle and it speeds up forever — and nobody holds a phone level, so it never stopped. The fix came from a gyroscope parallax library still sitting in this repo from an older site: treat tilt as a **position**, not a push. Lean the phone, the pattern shifts a bounded distance and stays there; level off and it returns. That library also re-zeroes itself when the device settles at a genuinely new angle, so carrying a phone upright becomes the new "level" instead of a permanent lean.
- **Making growth directional** was the last problem, and the most interesting one aesthetically. The obvious approaches — spreading faster along the tilt axis, or letting one side of the screen mature faster — both destroy the coral, turning it into rolling tiger stripes. Anything that biases a *direction* stretches the pattern into bands. What works is to bias the *ground* instead: more land becomes fertile toward the tilt, so the coral simply has more room to grow that way. It gets direction without ever being pushed.

That last point is the closest thing here to a general principle. Every attempt to make this system do something by acting on the pattern directly made it worse. Every success came from changing the conditions it grows in and letting it work out the shape itself.

## Numbers, for the curious
- The simulation runs on the graphics card as a shader, about fifteen steps per rendered frame, on a grid roughly 640 cells wide.
- Feed and kill sit at 0.0496 and 0.0619 — coral territory, a region a few thousandths wide.
- Drift moves the fertility field 0.085 units per second, where one unit is roughly one blob.
- It pauses when the tab is hidden, and shows a single still frame if the visitor has asked for reduced motion.

There is also a hidden tuning page in the site with every parameter exposed as a live slider, including views of the raw internals. It was built as a debugging tool and turned out to be the most enjoyable part of the project — the parameter space is worth wandering around in, and most of the final settings were found by dragging sliders and watching, not by calculation.
