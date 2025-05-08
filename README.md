# Hell Orbit

A top-down arcade-style boss fight developed using **p5.js**. Control a player with WASD or arrow keys to dodge incoming attacks and eventually defeat the boss. Includes upgrade mechanics, dynamic attack logic, and multiple bullet patterns.

---

## Features

- **Player Movement**: Smooth acceleration-based controls with friction and max speed.
- **Boss AI**:
  - Dynamically chooses attacks based on player behavior (e.g. inactivity triggers lasers).
  - Weighted random attack selection.
- **Health System**:
  - Visual health bars for both player and boss.
  - Passive regen for player (affected by upgrades).
- **Upgrade Shop**:
  - Speed, Health, Damage, Fire Rate, Bullet Speed, Health Regen.
  - Scalable cost and level tracking.
- **Game States**: Menu → Playing → Game Over, with restart support.

---

## Project Structure

- `GameManager`: Controls the game and is the highest order in the hierarchy.
  - `StateMachine`: Checks game states (gameOver, menu, playing) and implements the logic to draw whatever is necessary.
  - `UpgradeManager`: Used for the game upgrades to seperate it from the original `GameManager`.
  - `UIManager`: Creates all the UI and visuals to be added in the `StateMachine`.
    - `HealthBar`: Has styling and positioning for `Boss` and `Player` healthbars.
    - `UpgradeButton`: Styles and positions the upgrade buttons at the bottom.
    - `GameOver`: Holds the menu for the player deaths and victories executed on game end.
    - `Menu`: Main menu that waits for player to click **Enter** before swapping to **Playing** state.
    - `Vignette`: Has **2** styles, default which is always applied for a black glow on the edges, and damage which flashes it red when `Player` takes damage.
    - `Background`: Uses 1d Perlin to make a procedural and interesting background "gradient".
  - `EntityManager`: Holds classes like `Player` and `Boss` to control shared properties.
    - `Player`: Holds all player logic including movement and rendering.
    - `Boss`: Holds most boss logic such as health and position.
      - `Attack`: Holds all `Boss` attacks and the respective data, determines what attack to use based on factors such as distance and idle time.
  - `EventHandler`: Listens for key and click events to execute gameplay actions.
  - `BulletManager`: Holds all bullet types that `Boss` can fire and shared properties.
    - `Bullet`: Holds universal data for all bullet types and updates shared properties.
      - `RandomBullet`: Randomly fires bullets in all directions.
      - `StraightBullet`: Fires bullets directly at the player.
      - `WaveBullet`: Fires bullets in a wave pattern.
      - `ShieldBullet`: Fires bullets that hover around the boss and block player bullets (WIP).
      - `SpiralBullet`: Fires bullets in a spiral pattern.
      - `LaserBullet`: Fires a powerful laser beam.
        
---

## Controls

| Action                 | Key               |
|------------------------|-------------------|
| Move                   | WASD / ARROWS     |
| Start Game             | ENTER / SPACE     |
| Restart Game           | ENTER / SPACE     |
| Speed Upgrade          | 1                 |
| Health Upgrade         | 2                 |
| Damage Upgrade         | 3                 |
| Fire Rate Upgrade      | 4                 |
| Larger Bullets Upgrade | 5                 |
| Health Regen Upgrade   | 6                 |
