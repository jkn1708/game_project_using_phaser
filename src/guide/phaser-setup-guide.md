# Phaser Initial Setup Guide

이 문서는 현재 프로젝트에 생성된 Phaser 초기 세팅 파일들이 어떤 역할을 하는지 설명합니다.

## 현재 구조

```text
src/
  game/
    config.ts
  guide/
    phaser-setup-guide.md
  scenes/
    MainScene.ts
  main.ts
```

각 파일의 역할은 아래와 같습니다.

- `src/main.ts`: Phaser 게임을 시작하는 엔트리 파일
- `src/game/config.ts`: Phaser 전체 설정 파일
- `src/scenes/MainScene.ts`: 처음 실행되는 게임 장면(Scene)

## 1. `src/main.ts`

이 파일은 브라우저에서 가장 먼저 실행되는 시작점입니다.

```ts
import Phaser from 'phaser'

import { gameConfig } from './game/config'

const container = document.getElementById('app')

if (!container) {
  throw new Error('Game container "#app" was not found.')
}

container.innerHTML = ''
document.body.style.margin = '0'
document.body.style.backgroundColor = '#101418'

new Phaser.Game(gameConfig)
```

### 여기서 하는 일

- `phaser` 라이브러리를 가져옵니다.
- `gameConfig`를 불러옵니다.
- `index.html`에 있는 `#app` 요소를 찾습니다.
- Phaser 게임 인스턴스를 생성합니다.

### 중요한 포인트

`new Phaser.Game(gameConfig)`가 실행되면 Phaser 엔진이 시작됩니다.  
이 한 줄이 실제로 게임을 부팅하는 코드입니다.

`document.getElementById('app')`는 HTML의 아래 코드와 연결됩니다.

```html
<div id="app"></div>
```

즉, Phaser가 만든 캔버스가 이 영역 안에 붙게 됩니다.

## 2. `src/game/config.ts`

이 파일은 Phaser 게임의 전역 설정을 모아둔 곳입니다.

```ts
import Phaser from 'phaser'

import { MainScene } from '../scenes/MainScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 600,
  backgroundColor: '#1b1f2a',
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
}
```

### 설정 항목 설명

- `type: Phaser.AUTO`
  - 브라우저 환경에 따라 WebGL 또는 Canvas 렌더러를 자동 선택합니다.

- `parent: 'app'`
  - Phaser 캔버스를 `id="app"`인 DOM 요소 안에 붙입니다.

- `width: 800`, `height: 600`
  - 게임의 기본 해상도입니다.

- `backgroundColor`
  - 게임의 기본 배경색입니다.

- `scene: [MainScene]`
  - 게임 시작 시 사용할 씬 목록입니다.
  - 지금은 `MainScene` 하나만 등록되어 있습니다.

- `scale.mode: Phaser.Scale.FIT`
  - 화면 비율을 유지하면서 브라우저 크기에 맞게 게임 화면을 조절합니다.

- `scale.autoCenter: Phaser.Scale.CENTER_BOTH`
  - 게임 화면을 브라우저 가운데 정렬합니다.

- `physics.default: 'arcade'`
  - Phaser의 Arcade Physics를 기본 물리 엔진으로 사용합니다.

- `gravity: { x: 0, y: 0 }`
  - 현재는 중력이 없는 상태입니다.
  - 탑다운 게임이나 기본 테스트에 자주 쓰는 설정입니다.

- `debug: false`
  - 물리 디버그 표시를 끈 상태입니다.

## 3. `src/scenes/MainScene.ts`

이 파일은 실제로 게임 화면 하나를 정의하는 파일입니다.

```ts
import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }

  create() {
    const { width, height } = this.scale

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x1b1f2a)
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 24, 'My Phaser Game', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: '#f8fafc',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 28, 'Start building your first scene here.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
  }
}
```

### Scene이란?

Phaser에서 Scene은 하나의 화면 단위입니다.

예를 들면 아래처럼 나눌 수 있습니다.

- 로딩 화면
- 메인 메뉴 화면
- 실제 플레이 화면
- 게임 오버 화면

지금의 `MainScene`은 첫 번째 플레이 화면 역할을 하는 기본 씬입니다.

### 코드 설명

- `extends Phaser.Scene`
  - Phaser의 Scene 클래스를 상속받아 우리 게임용 씬을 만듭니다.

- `super('MainScene')`
  - 이 씬의 이름을 등록합니다.
  - 나중에 씬 전환할 때 이름으로 사용할 수 있습니다.

- `create()`
  - 씬이 준비된 뒤 한 번 실행되는 함수입니다.
  - 현재는 배경과 텍스트를 화면에 그립니다.

- `const { width, height } = this.scale`
  - 현재 게임 화면의 가로, 세로 크기를 가져옵니다.

- `this.add.rectangle(...)`
  - 화면에 사각형을 추가합니다.
  - 지금은 배경 역할을 합니다.

- `this.add.text(...)`
  - 텍스트를 화면에 출력합니다.

- `setOrigin(0.5)`
  - 기준점을 가운데로 옮깁니다.
  - 그래서 `width / 2`, `height / 2` 위치에 정확히 중앙 정렬됩니다.

## Phaser에서 자주 보는 함수

씬에서는 보통 아래 함수들을 많이 사용합니다.

### `preload()`

- 이미지, 사운드, 스프라이트시트 같은 리소스를 미리 불러옵니다.

예시:

```ts
preload() {
  this.load.image('player', '/assets/player.png')
}
```

### `create()`

- 화면에 오브젝트를 생성하고 초기 배치를 합니다.

예시:

```ts
create() {
  this.add.image(400, 300, 'player')
}
```

### `update()`

- 매 프레임 반복 실행됩니다.
- 캐릭터 이동, 적 행동, 충돌 검사 같은 실시간 로직을 넣습니다.

예시:

```ts
update() {
  // 매 프레임 실행되는 로직
}
```

## 실행 흐름

현재 프로젝트는 아래 순서로 동작합니다.

1. 브라우저가 `src/main.ts`를 실행합니다.
2. `new Phaser.Game(gameConfig)`가 호출됩니다.
3. Phaser가 `src/game/config.ts`의 설정을 읽습니다.
4. 등록된 씬인 `MainScene`을 시작합니다.
5. `MainScene.create()`가 실행됩니다.
6. 배경과 텍스트가 화면에 표시됩니다.

## 지금 상태에서 할 수 있는 다음 단계

처음 Phaser를 익힐 때는 보통 아래 순서로 진행하면 좋습니다.

1. `preload()`를 추가해서 이미지 불러오기
2. `create()`에서 플레이어 스프라이트 생성
3. `update()`에서 키보드 입력으로 이동 처리
4. 물리 충돌과 카메라 이동 추가

## 추천 학습 포인트

처음에는 아래 개념 4개만 익혀도 Phaser 흐름이 훨씬 잘 보입니다.

- Game: Phaser 전체 실행 객체
- Config: 게임 설정 모음
- Scene: 화면 단위
- Game Object: 텍스트, 이미지, 스프라이트 같은 화면 요소

## 한 줄 정리

현재 코드는 "Phaser 게임을 실행하기 위한 최소 시작 구조"이며,  
이제 여기에 에셋 로딩, 플레이어 생성, 입력 처리, 충돌 처리 등을 하나씩 추가해 나가면 됩니다.
