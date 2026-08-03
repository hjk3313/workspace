# 풍동(Wind Tunnel) 실험 프로그램 설계

## 목적
STL로 임의 3D 물체를 업로드하면, 근사 CFD(격자 기반 유체역학, Lattice Boltzmann Method)로 주변 공기 흐름을 시뮬레이션하고 속도장/압력장 3D 시각화, 시간에 따른 애니메이션, 항력/양력 계수(Cd/Cl)를 출력하는 Python 프로그램.

## 환경 확인 (2026-08-03 기준)
- GPU 없음 (`nvidia-smi` 없음)
- numpy, trimesh, pyvista 모두 미설치 (pip 설치 필요)
- OpenFOAM 등 외부 CFD 솔버 없음

## 채택 접근법: 순수 NumPy 3D LBM + trimesh + pyvista

검토한 대안:
- **XLB(JAX 기반 LBM, GPU 가속)**: GPU 없는 환경이라 이점 없음, 의존성만 무거움. 기각.
- **OpenFOAM 래핑**: 가장 정확하지만 설치가 GB 단위, STL 메싱(snappyHexMesh) 자동화 별도 필요. "근사"로 충분하다는 요구사항과 안 맞음. 기각. (정확도 부족해지면 업그레이드 경로로 고려)
- **채택**: GPU 불필요, pip 설치만으로 완결, STL을 trimesh로 격자화하고 D3Q19 LBM 솔버를 numpy로 직접 구현. 실시간이 아닌 배치 시뮬레이션(실행 후 결과 확인) 방식.

## 디렉토리 구조
`wind-tunnel/` — 독립 self-contained 디렉토리 (calculator/ 와 동일한 패턴, 다른 서브디렉토리와 공유 설정 없음)

```
wind-tunnel/
  voxelize.py    # STL -> 3D occupancy grid
  lbm.py         # D3Q19 LBM 솔버 코어
  forces.py      # Cd/Cl 계산
  visualize.py   # pyvista 3D 렌더 + 애니메이션, matplotlib 그래프
  run.py         # CLI 진입점
  tests/         # 자체 검증 스크립트
  requirements.txt
```

## 컴포넌트

### voxelize.py
- 입력: STL 파일 경로, 격자 해상도(nx, ny, nz)
- `trimesh.load()` 로 메쉬 로드 → non-watertight면 `trimesh.repair` 시도 → 실패 시 예외 발생시켜 중단
- 물체 바운딩박스가 지정 해상도의 유동 도메인보다 크면 에러(치수 안내 메시지)
- `mesh.voxelized(pitch=...).matrix` 로 3D boolean occupancy grid 생성, 유동 도메인 배열에 배치(물체는 앞쪽 1/3 지점에 위치, 뒤로 wake 관찰 공간 확보)
- 출력: (nx, ny, nz) boolean numpy 배열 (True = solid)

### lbm.py
- D3Q19 격자 (19방향 속도), BGK collision operator
- 매 스텝: collision → streaming → 경계조건 적용
- 경계조건:
  - inlet(x=0): 고정 속도(균일 유입류) 경계
  - outlet(x=nx-1): 압력/유출 경계 (zero-gradient)
  - 도메인 벽(y, z 경계): no-slip bounce-back 또는 free-slip (기본은 no-slip)
  - 물체 표면: bounce-back (no-slip)
- 입력: occupancy grid, 유입속도, 레이놀즈수(점성 계수 산출용), 총 스텝수, 스냅샷 저장 간격 K
- 매 스텝 안정성 체크: density/velocity에 NaN 또는 임계치 초과 발생 시 즉시 중단 + "해상도 낮추거나 유입속도 낮추라" 안내 메시지 출력 후 종료
- 출력: `snapshots/step_XXXXXX.npz` (velocity 3D 필드, density 3D 필드) 매 K스텝마다 저장

### forces.py
- 물체 표면(경계) 노드에서 bounce-back 시 교환되는 운동량을 적산하는 momentum-exchange method로 매 스텝 힘(Fx, Fy, Fz) 계산
- 무차원화하여 Cd, Cl 시계열 산출, `forces.csv` 로 저장

### visualize.py
- `snapshots/*.npz` 순서대로 로드
- pyvista로 3D volume render + streamline + 물체 표면 슬라이스 렌더링
- 프레임을 순서대로 이어 gif/mp4 애니메이션으로 export
- `forces.csv` 를 matplotlib으로 그래프(Cd/Cl vs step) 출력

### run.py (CLI)
인자: `--stl <path> --nx --ny --nz --reynolds --steps --snapshot-interval --output-dir`
전체 파이프라인(voxelize → lbm → forces 누적 → 종료 후 visualize)을 순서대로 실행.

## 데이터 흐름
STL 파일 → voxelize (occupancy grid) → LBM 시간 루프(N 스텝, 매 K스텝 스냅샷 저장 + 매 스텝 힘 적산) → 종료 → visualize.py가 스냅샷/힘 데이터를 읽어 애니메이션 + 그래프 생성

## 에러 처리
- STL 로드 실패 또는 non-watertight 메쉬 repair 실패 → 예외로 즉시 중단, 원인 출력
- 물체가 유동 도메인보다 큼 → voxelize 단계에서 사전 체크 후 에러
- 시뮬레이션 발산(NaN, 속도 폭주) → 매 스텝 감지, 중단 + 안정성 힌트 출력

## 테스트 (각 핵심 로직에 최소 자체 검증 1개)
- `tests/test_lbm_poiseuille.py`: 벽 없는 평행판 사이 layered flow(Poiseuille flow)를 시뮬레이션해 정상상태 속도 프로파일이 해석해(포물선 프로파일)와 assert 오차범위 내 일치하는지 확인
- `tests/test_voxelize.py`: 단순 큐브 STL을 voxelize해 occupancy grid의 채움 비율이 기대값과 assert로 일치하는지 확인
- `tests/test_pipeline_smoke.py`: 저해상도(예: 20x10x10) + 짧은 스텝으로 구 형상을 돌려 파이프라인이 에러 없이 끝까지 실행되고 Cd가 저 레이놀즈수 근사 범위(스토크스 근사) 근처인지 확인

## 성능
- CPU 전용 numpy 벡터 연산. 기본 해상도 96x48x48(약 22만 셀).
- 스텝수와 해상도는 CLI 인자로 조절 가능 (정밀도-속도 트레이드오프는 사용자가 실행 시점에 선택)
- 실시간 아님: 시뮬레이션을 먼저 끝까지 돌린 후 결과를 시각화하는 배치 방식
