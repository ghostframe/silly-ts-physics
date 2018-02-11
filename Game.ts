class Point {
  constructor(public x: number, public y: number) {}
  static origin = new Point(0, 0);
  multiply(number: number): Point {
    return new Point(this.x * number, this.y * number);
  }
  add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }
}

abstract class Entity {
  constructor(public position: Point, public velocity: Point, public acceleration: Point) {}
  abstract draw(context: CanvasRenderingContext2D);
}

class Physics {
  static refresh_rate_seconds = 0.01;
  static gravity = new Point(0, 1500);
  static ground_y = 600;

  constructor(private entities: Entity[]) {
    setInterval(() => this.update(), Physics.refresh_rate_seconds * 1000);
  }

  private update() {
      this.entities.forEach(Physics.updateEntity);
  }

  private static updateEntity(entity: Entity) {
    var nextPosition = Physics.getPositionAfter(Physics.refresh_rate_seconds, entity);
    if (nextPosition.y > Physics.ground_y) {
      Physics.bounceVertically(entity);
    } else {
      entity.position = nextPosition;
      entity.velocity = Physics.getVelocityAfter(Physics.refresh_rate_seconds, entity);
    }
  }

  private static getPositionAfter(time: number, entity: Entity): Point {
    return entity.position
           .add(entity.velocity.multiply(time))
           .add(entity.acceleration.multiply(0.5).multiply(time ** 2));
  }

  private static getVelocityAfter(time: number, entity: Entity): Point {
    return entity.velocity
           .add(entity.acceleration.multiply(time));
  }

  private static bounceVertically(entity) {
    var timeToBounce = Physics.getRootsForQuadratic(
      entity.acceleration.y * 0.5,
      entity.velocity.y,
      entity.position.y - Physics.ground_y
    )[0];
    var velocityAfterBounce = Physics.getVelocityAfter(timeToBounce, entity).multiply(-1);
    entity.velocity = velocityAfterBounce;
    entity.position.y = Physics.ground_y;
    var timeAfterBounce = Physics.refresh_rate_seconds - timeToBounce;
    entity.velocity = Physics.getVelocityAfter(timeAfterBounce, entity);
    entity.position = Physics.getPositionAfter(timeAfterBounce, entity);
  }

  private static getRootsForQuadratic(a, b, c): number[] {
    var determinant = Math.sqrt(b ** 2 - 4 * a * c);
    var firstRoot = (- b + determinant) / (2 * a);
    var secondRoot = (- b - determinant) / (2 * a);
    return [firstRoot, secondRoot];
  }

}

class Box extends Entity {

  public size: Point;

  constructor(position: Point, velocity: Point, acceleration: Point, size: Point) {
    super(position, velocity, acceleration);
    this.size = size;
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
  }
}

class Graphics {
  private entities: Entity[];
  private canvas: HTMLCanvasElement;
  private canvasRenderingContext: CanvasRenderingContext2D;

  constructor(entities: Entity[], canvas: HTMLCanvasElement) {
    this.entities = entities;
    this.canvas = canvas;
    this.canvasRenderingContext = canvas.getContext("2d");
    setInterval(() => this.draw(), Physics.refresh_rate_seconds * 1000);
  }

  private draw() {
    this.canvasRenderingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.entities.forEach(element => element.draw(this.canvasRenderingContext));
    this.canvasRenderingContext.stroke();
  }
}

class Game {
  private graphics: Graphics;
  private physics: Physics;
  constructor(entities, canvas) {
    this.graphics = new Graphics(entities, canvas);
    this.physics = new Physics(entities);
  }


}
new Game(
  [
    new Box(new Point(0, 0), new Point(0, 0), Physics.gravity, new Point(10, 10)),
    new Box(new Point(0, 300), new Point(0, 0), Physics.gravity, new Point(10, 10))
  ],
  document.getElementById("canvas")
);
