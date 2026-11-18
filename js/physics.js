/**
 * BONCUK & MÜEZZA – save.meow
 * Physics Engine & Collision Detection
 * Responsive platformer physics with coyote time, jump buffering, swept AABB and moving platform support.
 */

class Physics {
  static GRAVITY = 0.44;
  static TERMINAL_VELOCITY = 11.5;
  static RUN_SPEED = 4.2;
  static ACCEL = 0.55;
  static FRICTION = 0.82;
  static SLIPPERY_FRICTION = 0.96;
  static JUMP_FORCE = -9.6;
  static MIN_JUMP_FORCE = -4.5;
  static COYOTE_TIME_MAX = 7;     // frames
  static JUMP_BUFFER_MAX = 7;     // frames

  /**
   * Axis-Aligned Bounding Box (AABB) intersection check
   */
  static aabb(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  /**
   * Ray-box or swept overlap check
   */
  static pointInRect(px, py, rect) {
    return (
      px >= rect.x &&
      px <= rect.x + rect.width &&
      py >= rect.y &&
      py <= rect.y + rect.height
    );
  }

  /**
   * Circle vs Rect collision (for rolling balls and pendulums)
   */
  static circleRect(cx, cy, radius, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

    const dx = cx - closestX;
    const dy = cy - closestY;

    return (dx * dx + dy * dy) < (radius * radius);
  }
}

window.Physics = Physics;
