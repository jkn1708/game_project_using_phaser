# Flappy Bird Phaser Development Notes

이 문서는 Flappy Bird 스타일 게임을 만들면서 오늘 적용한 Phaser 핵심 기능들을 정리한 문서입니다.

## 오늘 만든 주요 기능

- SVG 기반 게임 에셋 로딩
- 클릭 / Space 입력 처리
- 새의 중력과 flap 동작
- 바닥 스크롤
- 파이프 장애물 이동과 리셋
- 점수 시스템
- 라이프 시스템
- 하트 UI
- 게임오버와 재시작
- `MainScene` 리팩토링과 모듈화

## 현재 파일 구조

```text
src/
  game/
    config.ts
    constants.ts
  objects/
    Bird.ts
    Ground.ts
    PipePair.ts
  scenes/
    MainScene.ts
  ui/
    Hud.ts
    GameOverPanel.ts
```

### 역할 정리

- `game/config.ts`
  - Phaser 게임 전체 설정을 담당합니다.
  - 화면 크기, 물리 엔진, Scene 등록을 설정합니다.

- `game/constants.ts`
  - 게임에서 자주 조절하는 숫자 값을 모아둡니다.
  - 예: 중력, 점프 속도, 파이프 속도, 바닥 높이, 라이프 수

- `scenes/MainScene.ts`
  - 실제 게임 흐름을 관리하는 중심 Scene입니다.
  - 에셋 로딩, 게임 시작, 점수 증가, 데미지, 게임오버 흐름을 연결합니다.

- `objects/Bird.ts`
  - 새 캐릭터를 담당합니다.
  - 물리 바디, 중력, flap, 회전, 충돌 범위를 관리합니다.

- `objects/Ground.ts`
  - 바닥을 담당합니다.
  - 바닥 이미지 2개를 이어 붙여 계속 스크롤되는 것처럼 보이게 합니다.

- `objects/PipePair.ts`
  - 파이프 장애물 한 쌍을 담당합니다.
  - 이동, 랜덤 위치 리셋, 통과 판정, 충돌 판정을 관리합니다.

- `ui/Hud.ts`
  - 게임 중 표시되는 UI를 담당합니다.
  - 점수와 하트 라이프를 표시합니다.

- `ui/GameOverPanel.ts`
  - 게임오버 화면을 담당합니다.
  - 최종 점수와 재시작 안내를 표시합니다.

## 1. Scene

Phaser에서 `Scene`은 하나의 화면 단위입니다.

현재 게임은 `MainScene` 하나로 구성되어 있습니다.

```ts
export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }
}
```

`super('MainScene')`은 이 Scene의 이름을 등록하는 코드입니다.  
나중에 `this.scene.restart()` 또는 `this.scene.start('MainScene')`처럼 Scene을 제어할 때 사용할 수 있습니다.

## 2. preload

`preload()`는 이미지나 사운드 같은 에셋을 미리 불러오는 함수입니다.

현재는 SVG 에셋을 아래처럼 로드하고 있습니다.

```ts
preload() {
  this.load.svg('bird-up', '/assets/flappy/bird-up.svg', { width: 72, height: 54 })
  this.load.svg('pipe', '/assets/flappy/pipe.svg', { width: 96, height: 520 })
  this.load.svg('heart-full', '/assets/flappy/heart-full.svg', { width: 48, height: 44 })
}
```

첫 번째 인자인 `'bird-up'`은 Phaser 안에서 사용하는 키입니다.  
두 번째 인자인 `'/assets/flappy/bird-up.svg'`는 실제 파일 경로입니다.

즉, 나중에 아래처럼 키를 사용해서 이미지를 화면에 추가할 수 있습니다.

```ts
this.add.image(220, 300, 'bird-up')
```

## 3. create

`create()`는 Scene이 시작될 때 한 번 실행됩니다.

현재 `MainScene.create()`에서는 배경, 파이프, 바닥, 새, UI를 생성합니다.

```ts
this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height)

this.pipePair = new PipePair(this, height, GAME_CONFIG.pipeGap)
this.ground = new Ground(this, width, height, GAME_CONFIG.groundHeight)
this.bird = new Bird(this, 220, height / 2)
this.hud = new Hud(this, width, this.lives)
```

중요한 점은 `MainScene`이 직접 모든 구현을 하지 않고, 각 객체 클래스를 생성해서 사용한다는 것입니다.

## 4. update

`update()`는 게임이 실행되는 동안 매 프레임 호출됩니다.

현재는 `isPlaying` 상태일 때만 바닥과 파이프를 움직이고, 충돌과 점수를 검사합니다.

```ts
update(_: number, delta: number) {
  if (!this.isPlaying || !this.bird || !this.ground || !this.pipePair) {
    return
  }

  this.ground.update(delta, GAME_CONFIG.groundSpeed)
  this.pipePair.update(delta, GAME_CONFIG.pipeSpeed, this.scale.width + 120)
}
```

여기서 `delta`는 이전 프레임부터 현재 프레임까지 걸린 시간입니다.  
`delta`를 사용하면 컴퓨터 성능에 따라 프레임이 달라져도 이동 속도를 비교적 일정하게 유지할 수 있습니다.

## 5. 입력 처리

클릭과 Space 입력은 `MainScene`에서 처리합니다.

```ts
this.input.on('pointerdown', () => this.flap())
this.input.keyboard?.on('keydown-SPACE', () => this.flap())
```

- `pointerdown`: 마우스 클릭 또는 터치 입력
- `keydown-SPACE`: Space 키 입력

현재는 두 입력 모두 `flap()`을 호출합니다.

`flap()`은 상황에 따라 다르게 동작합니다.

- 게임오버 상태면 Scene 재시작
- 시작 전이면 게임 시작
- 플레이 중이면 새가 위로 튐

```ts
private flap() {
  if (this.isGameOver) {
    this.scene.restart({ autoStart: true } satisfies SceneStartData)
    return
  }

  if (!this.isPlaying) {
    this.startGame()
  }

  this.bird?.flap(GAME_CONFIG.flapVelocity)
}
```

## 6. Physics

새는 일반 이미지가 아니라 Physics 이미지로 생성했습니다.

```ts
this.sprite = scene.physics.add.image(x, y, 'bird-up').setScale(1.35)
```

이렇게 만들면 새가 아래 기능을 사용할 수 있습니다.

- 중력
- 속도
- 충돌 범위
- 월드 경계 충돌

처음에는 시작 화면에서 새가 떨어지면 안 되므로 중력을 꺼둡니다.

```ts
this.sprite.body.allowGravity = false
```

게임이 시작되면 중력을 켭니다.

```ts
this.sprite.body.allowGravity = true
this.sprite.setGravityY(gravityY)
```

클릭이나 Space를 누르면 위쪽 속도를 줍니다.

```ts
this.sprite.setVelocityY(velocityY)
```

Phaser 좌표계에서는 아래로 갈수록 `y` 값이 커집니다.  
그래서 위로 튀게 하려면 `velocityY`에 음수 값을 줍니다.

```ts
flapVelocity: -340
```

## 7. 바닥 스크롤

Flappy Bird 스타일 게임에서는 새가 앞으로 이동하는 것처럼 보여야 합니다.  
하지만 실제로는 새의 `x` 위치를 거의 고정하고, 바닥과 장애물을 왼쪽으로 움직입니다.

`Ground`는 바닥 이미지 2개를 이어 붙입니다.

```ts
this.tiles = [
  scene.add.image(0, height - groundHeight, 'ground').setOrigin(0, 0).setDisplaySize(width, groundHeight),
  scene.add.image(width, height - groundHeight, 'ground').setOrigin(0, 0).setDisplaySize(width, groundHeight),
]
```

매 프레임 왼쪽으로 이동하다가, 한 장이 화면 밖으로 나가면 다시 오른쪽으로 보냅니다.

```ts
if (ground.x <= -this.width) {
  ground.x += this.width * this.tiles.length
}
```

이렇게 하면 바닥이 무한히 이어지는 것처럼 보입니다.

## 8. 파이프 장애물

`PipePair`는 위 파이프와 아래 파이프 한 쌍을 관리합니다.

```ts
this.pipes = [
  scene.add.image(0, -150, 'pipe').setFlipY(true),
  scene.add.image(0, height - 260, 'pipe'),
]
```

위쪽 파이프는 `setFlipY(true)`로 뒤집어서 사용합니다.

파이프가 화면 왼쪽 밖으로 나가면 오른쪽으로 다시 보냅니다.

```ts
if (this.pipes[0].x < -80) {
  this.reset(resetX)
}
```

리셋할 때는 통과 구멍의 중심 위치를 랜덤하게 정합니다.

```ts
const gapCenter = Phaser.Math.Between(170, 340)
```

## 9. 점수 시스템

점수는 새가 파이프를 지나가면 1점 올라갑니다.

```ts
if (this.pipePair.hasPassed(this.bird.sprite.x)) {
  this.addScore()
}
```

`PipePair` 안에서는 이미 점수를 줬는지 `scored` 값으로 관리합니다.

```ts
hasPassed(x: number) {
  return !this.scored && this.pipes[0].x < x
}
```

점수를 올린 뒤에는 다시 중복 점수가 들어가지 않도록 표시합니다.

```ts
this.pipePair.markScored()
```

## 10. 충돌 판정

현재 충돌 판정은 Phaser의 사각형 교차 검사로 처리합니다.

```ts
Phaser.Geom.Intersects.RectangleToRectangle(birdBounds, pipeBounds)
```

다만 이미지의 실제 외곽선을 그대로 쓰면 너무 빡빡하게 느껴질 수 있습니다.  
그래서 새와 파이프의 충돌 박스를 조금 줄였습니다.

```ts
Phaser.Geom.Rectangle.Inflate(bounds, -18, -14)
```

음수 값을 넣으면 사각형이 안쪽으로 줄어듭니다.  
이렇게 하면 살짝 스치는 정도는 충돌로 처리되지 않아 더 자연스럽게 느껴집니다.

## 11. 라이프와 하트 UI

라이프는 내부적으로 총 6칸입니다.

```ts
maxLives: 6
```

화면에는 하트 3개로 표시됩니다.

- 라이프 6: 하트 3개
- 라이프 5: 하트 2.5개
- 라이프 4: 하트 2개
- 라이프 3: 하트 1.5개
- 라이프 2: 하트 1개
- 라이프 1: 하트 0.5개
- 라이프 0: 게임오버

`Hud`는 라이프 값에 따라 하트 이미지를 바꿉니다.

```ts
const textureKey = lifeValue >= 2 ? 'heart-full' : lifeValue === 1 ? 'heart-half' : 'heart-empty'

heart.setTexture(textureKey)
```

## 12. 데미지와 무적 시간

새가 바닥이나 파이프에 닿으면 `takeDamage()`가 실행됩니다.

```ts
this.lives -= 1
this.hud?.setLives(this.lives)
```

라이프가 남아 있으면 잠깐 무적 상태가 됩니다.

```ts
this.isInvulnerable = true
```

이 무적 상태가 없으면 한 번 부딪힌 순간 여러 프레임 동안 계속 충돌로 처리되어 라이프가 순식간에 0이 될 수 있습니다.

무적 중에는 새가 깜빡이도록 tween을 사용했습니다.

```ts
this.tweens.add({
  targets: this.bird.sprite,
  alpha: 0.35,
  duration: 90,
  yoyo: true,
  repeat: 8,
})
```

## 13. Tween

Tween은 오브젝트의 값을 시간에 따라 자동으로 바꿔주는 기능입니다.

현재는 데미지를 입었을 때 새가 깜빡이는 효과에 사용했습니다.

- `targets`: 애니메이션 대상
- `alpha`: 투명도
- `duration`: 한 번 변화하는 데 걸리는 시간
- `yoyo`: 다시 원래 값으로 돌아오기
- `repeat`: 반복 횟수
- `onComplete`: 애니메이션이 끝난 뒤 실행할 함수

## 14. 게임오버와 재시작

라이프가 0이 되면 `endGame()`이 실행됩니다.

```ts
this.isPlaying = false
this.isGameOver = true
this.bird.stop()
new GameOverPanel(this, this.scale.width, this.scale.height, this.score, this.lives)
```

게임오버 상태에서 클릭이나 Space를 누르면 Scene을 재시작합니다.

```ts
this.scene.restart({ autoStart: true } satisfies SceneStartData)
```

`autoStart: true`를 넘기는 이유는 재시작 후 시작 화면에서 멈추지 않고 바로 플레이 상태로 들어가기 위해서입니다.

`create()`에서는 이 값을 보고 바로 게임을 시작합니다.

```ts
if (data.autoStart) {
  this.startGame()
  this.bird?.flap(GAME_CONFIG.flapVelocity)
}
```

## 15. 상태 관리

현재 `MainScene`에는 아래 상태값들이 있습니다.

- `isPlaying`
  - 게임이 실제로 진행 중인지 나타냅니다.

- `isGameOver`
  - 게임오버 상태인지 나타냅니다.

- `isInvulnerable`
  - 데미지 직후 잠깐 무적 상태인지 나타냅니다.

- `score`
  - 현재 점수입니다.

- `lives`
  - 현재 라이프입니다.

이 상태값들 덕분에 같은 입력이라도 상황에 따라 다르게 처리할 수 있습니다.

예를 들면 클릭 입력은 아래처럼 달라집니다.

- 시작 전: 게임 시작
- 플레이 중: flap
- 게임오버: 재시작

## 16. 모듈화

처음에는 모든 코드가 `MainScene.ts`에 들어갔습니다.  
하지만 기능이 늘어나면서 파일이 커졌기 때문에 역할별로 분리했습니다.

현재 `MainScene`은 전체 흐름을 조율하는 역할입니다.

```ts
this.ground.update(delta, GAME_CONFIG.groundSpeed)
this.pipePair.update(delta, GAME_CONFIG.pipeSpeed, this.scale.width + 120)

if (this.pipePair.hasPassed(this.bird.sprite.x)) {
  this.addScore()
}
```

세부 구현은 각 클래스가 담당합니다.

- 새 관련 기능은 `Bird`
- 바닥 관련 기능은 `Ground`
- 파이프 관련 기능은 `PipePair`
- 점수와 하트는 `Hud`
- 게임오버 화면은 `GameOverPanel`

이 구조의 장점은 기능을 추가하거나 수정할 때 관련 파일만 보면 된다는 점입니다.

## 다음에 추가하기 좋은 기능

- 파이프 여러 쌍을 동시에 관리하기
- 파이프 충돌을 Arcade Physics 기반으로 바꾸기
- 배경을 천천히 스크롤하기
- 최고 점수 저장하기
- 시작 화면과 게임오버 화면을 별도 Scene으로 분리하기
- 효과음 추가하기
- 모바일 화면 대응 개선하기

## 한 줄 정리

오늘 작업으로 Phaser의 핵심 흐름인 `preload -> create -> update`를 실제 게임에 적용했고,  
Physics, Input, Tween, 충돌 판정, UI, Scene 재시작, 모듈화를 함께 경험했습니다.
