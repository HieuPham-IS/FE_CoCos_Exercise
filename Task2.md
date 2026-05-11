# Task 2 – Requirements

Requirements include **two parts**:

1. **Create & handle the table** (reels/symbols/spin flow)
2. **Show result** (stop reels, then update win + wallet)

---

## Part 1: Create & handle the table

### Table structure

| Item | Quantity | Description |
|------|----------|-------------|
| **Symbol prefab** | 1 | Single prefab used for every symbol on the table. |
| **Reel** | 1 type | One reel holds **5 symbols**: **3 main** (visible in the window) + **2 buffer** (1 top, 1 bottom) for scroll effect. |
| **Table** | 1 | The table contains **5 reels** (5 columns). |

### Reel layout (per reel)

| Slot | Role |
|------|------|
| 1 | Buffer (top) – above visible area |
| 2 | Main symbol |
| 3 | Main symbol |
| 4 | Main symbol |
| 5 | Buffer (bottom) – below visible area |

**Total symbols per reel:** 5 (3 main + 2 buffer).

### Table summary

| | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|--|--------|--------|--------|--------|--------|
| **Symbols** | 5 | 5 | 5 | 5 | 5 |
| **Visible** | 3 | 3 | 3 | 3 | 3 |

- **Total symbols on table:** 5 reels × 5 symbols = **25**.
- **Visible symbols:** 5 reels × 3 main = **15**.

---

### Spin flow

1. User presses **Spin** (only allowed after join game success, and not while showing result).
2. Client sends a **spin request** with the **BetId** of the **current bet level** (e.g. `10`, `20`, `30`, …).
3. Server returns spin data **for that bet level** (e.g. `Bet10.json`, `Bet20.json`, `Bet30.json` in `data/GameData/`).
4. Client uses the response to drive reels and show the result (e.g. matrix `matrix`) for the selected BetId.

> **Matrix order:** `matrix` is a list of symbol codes ordered **top-to-bottom, left-to-right**.

> **Note:** Each bet level can have its own spin response file; the request **BetId** must match the data used for that spin.

---

## Part 2: Show result

After the spin result is received and the reels start stopping:

1. Stop **all reels** and ensure the table shows the expected result.
2. When **all reels have fully stopped**:
   - Update the **Win Amount** label (the win display box).
   - Add the win amount to the user's **wallet** and update the **Wallet** label.
3. Only after **show result is finished** may the user change bet level or press **Spin** again.

**Format:** Wallet, Jackpot, Bet Value and Win Amount labels must display values using **`formatMoney`** from `scripts/utils/utils.ts`.

---

## Spin animation idea (tween + recycle)

## Idea

Spin uses a lightweight loop:

- Tween the reel container **down by exactly 1 × symbolHeight** per step.
- After each step completes, **recycle** the bottom symbol node to the top.
- Keep repeating while waiting for the spin result.
- When the result arrives, spin a few extra steps, then stop **exactly** on the expected result.

## Per-step algorithm (one reel)

1. Tween reel container: `y -= symbolHeight`.
2. On tween complete:
   - Reset container position (avoid drifting error).
   - Take the **bottom** symbol node and move it to the **top buffer** position.
   - Update the recycled symbol’s sprite/id to the **next incoming symbol**.
3. Repeat.

This produces continuous scrolling without creating/destroying nodes.

## Stop on result (land on the target 3 symbols)

> **Important:** Bet change / Spin must only be enabled **after JOIN_GAME_SUCCESS** and **after show result is finished** (after Win Amount + Wallet have been updated).
