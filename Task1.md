# Ex1 Main Game – Exercise

## Description

This exercise uses the **MainGame** scene and wires all **MainUI** elements to match the reference layout **MainG_Demo** (file `data/MainUI/MainG_Demo.png`). Watch **VideoDemo.mov** to understand the flow and requirements.

## Requirements – 2 steps

### Step 1: Handle data after Join Game success

After a successful join game, the client receives join game data (sample in `scripts/core/JoinGame.json`). The data includes:

- **mainBet** (string): list of bet levels
- **jackpot** (object): jackpot value per bet level
- **wallet** (number): wallet balance

#### 1.1. Parse `mainBet` → BetId and BetValue

- The `mainBet` string has the form: `"BetId1;BetValue1,BetId2;BetValue2,..."`  
  Example: `"10;1.00,20;2.00,30;3.00,..."`
- Split the string to get **key = BetId** and **value = BetValue** (number).
- **1 credit = 25**. Formula: **BetDenom = BetValue / 25** (credit).

#### 1.2. Jackpot per bet level

- Each bet level has a corresponding jackpot (in the `jackpot` object).
- When the user **changes bet level** (Plus/Minus), the displayed jackpot must **update** to match the selected bet level.

#### 1.3. Wallet

- Update the **wallet** for the user with the exact `wallet` value returned in the join game data.

> **Important:** Only after join game **succeeds** may the user change bet level (Plus/Minus) or press the **Spin** button. Before that, those actions must be disabled or ignored.

---

### Step 2

(Watch the demo video and complete step 2 according to the specific requirements of the exercise.)

---

## Sample data – JoinGame.json

| Field    | Description |
|----------|-------------|
| `mainBet` | String of `BetId;TotalBet` pairs separated by commas. |
| `jackpot` | Object: key is jackpot id (e.g. `1_USD_GRAND`), value is amount. Index order 1, 2, … matches the order of bet levels in `mainBet`. |
| `wallet`  | Wallet balance (number). |

**Format:** Wallet, Jackpot, Bet Value and Win Amount labels must display values using **`formatMoney`** from `scripts/utils/utils.ts`.

## Implementation notes

- Parse `mainBet` into `Record<BetId, TotalBet>` and compute `BetDenom = TotalBet / 25` for each level.
- Map bet levels (in order) to keys in `jackpot` so that changing bet updates the displayed jackpot.
- Listen for the **JOIN_GAME_SUCCESS** event, receive data → parse → update UI (TotalBet, Jackpot, Wallet) and keep state and BetId when changing bet level.
