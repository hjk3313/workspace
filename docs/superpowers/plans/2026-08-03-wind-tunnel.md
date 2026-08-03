# Wind Tunnel Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Python program that takes an STL file, runs a 3D approximate CFD simulation (Lattice Boltzmann Method) of air flow around it, and outputs 3D velocity/pressure visualization, an animation, and drag/lift coefficients (Cd/Cl).

**Architecture:** STL → voxelized occupancy grid (trimesh) → D3Q19 Lattice Boltzmann solver (pure NumPy, CPU) run for N steps, snapshotting velocity/density fields and accumulating surface forces every step → post-run visualization (PyVista 3D render + animation, Matplotlib force-vs-time plot).

**Tech Stack:** Python 3, NumPy (solver core), trimesh (STL → voxel grid), PyVista (3D rendering/animation), Matplotlib (force plots), pytest (tests).

## Global Constraints

- Self-contained directory: all code lives under `wind-tunnel/`, no shared config with other subdirectories in this workspace (per repo CLAUDE.md).
- No GPU available in this environment — solver must run on CPU via NumPy only.
- Environment has Python 3.14.4 / pip 25.1.1, no numpy/trimesh/pyvista preinstalled — all added via `wind-tunnel/requirements.txt`.
- Batch simulation, not real-time: pipeline runs to completion, then visualization is generated from saved snapshots.
- Every non-trivial module gets one runnable pytest test (per spec's test section) — no test frameworks beyond pytest, no fixtures beyond what's inline.

---

## File Structure

```
wind-tunnel/
  requirements.txt
  conftest.py          # adds wind-tunnel/ to sys.path for flat imports in tests
  voxelize.py           # STL -> 3D occupancy grid
  lbm.py                # D3Q19 LBM solver core + step/run_simulation
  forces.py             # momentum-exchange Cd/Cl computation
  visualize.py           # PyVista 3D render/animation + Matplotlib force plot
  run.py                 # CLI entry point, wires the pipeline together
  tests/
    test_voxelize.py
    test_lbm_poiseuille.py
    test_forces.py
    test_visualize.py
    test_pipeline_smoke.py
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `wind-tunnel/requirements.txt`
- Create: `wind-tunnel/conftest.py`

**Interfaces:**
- Produces: a `wind-tunnel/` directory that `pip install -r requirements.txt` succeeds in, and a `conftest.py` that makes `import voxelize`, `import lbm`, `import forces`, `import visualize`, `import run` work from any file under `wind-tunnel/tests/`.

- [ ] **Step 1: Create the directory and requirements file**

```bash
mkdir -p /home/hjk33/workspace/wind-tunnel/tests
```

`wind-tunnel/requirements.txt`:
```
numpy
trimesh
pyvista
matplotlib
imageio
pytest
```

- [ ] **Step 2: Install and verify**

Run: `cd /home/hjk33/workspace/wind-tunnel && pip install -r requirements.txt`
Expected: installs without error. If any package fails to build against Python 3.14, pin that package to its latest release supporting 3.14 (check `pip index versions <pkg>` output) and retry — do not downgrade Python.

- [ ] **Step 3: Write conftest.py**

```python
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
```

- [ ] **Step 4: Sanity-check imports**

Run: `cd /home/hjk33/workspace/wind-tunnel && python3 -c "import numpy, trimesh, pyvista, matplotlib, imageio; print('ok')"`
Expected: prints `ok`

- [ ] **Step 5: Commit**

```bash
git add wind-tunnel/requirements.txt wind-tunnel/conftest.py
git commit -m "Scaffold wind-tunnel project"
```

---

### Task 2: voxelize.py — STL to occupancy grid

**Files:**
- Create: `wind-tunnel/voxelize.py`
- Test: `wind-tunnel/tests/test_voxelize.py`

**Interfaces:**
- Produces: `voxelize.voxelize_stl(stl_path: str, nx: int, ny: int, nz: int, domain_fraction: float = 0.6) -> np.ndarray[bool]` of shape `(nx, ny, nz)`, `True` = solid. Raises `ValueError` if the mesh is non-watertight and unrepairable, or if the object doesn't fit inside `domain_fraction` of the domain after scaling.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Write the failing test**

```python
# wind-tunnel/tests/test_voxelize.py
import numpy as np
import trimesh
import pytest
from voxelize import voxelize_stl


def _write_cube_stl(tmp_path, size=1.0):
    mesh = trimesh.creation.box(extents=(size, size, size))
    path = tmp_path / "cube.stl"
    mesh.export(path)
    return str(path)


def test_voxelize_cube_fill_ratio(tmp_path):
    stl_path = _write_cube_stl(tmp_path)
    grid = voxelize_stl(stl_path, nx=40, ny=20, nz=20)

    assert grid.shape == (40, 20, 20)
    assert grid.dtype == bool
    # a solid cube should fill a solid, contiguous block - not empty, not everything
    fill_ratio = grid.sum() / grid.size
    assert 0.02 < fill_ratio < 0.5


def test_voxelize_rejects_oversized_object(tmp_path):
    # a cube far larger than the domain should raise, not silently clip
    mesh = trimesh.creation.box(extents=(100.0, 100.0, 100.0))
    path = tmp_path / "huge.stl"
    mesh.export(path)
    with pytest.raises(ValueError):
        voxelize_stl(str(path), nx=10, ny=10, nz=10, domain_fraction=0.01)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_voxelize.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'voxelize'`

- [ ] **Step 3: Implement voxelize.py**

```python
# wind-tunnel/voxelize.py
import numpy as np
import trimesh


def voxelize_stl(stl_path: str, nx: int, ny: int, nz: int,
                  domain_fraction: float = 0.6) -> np.ndarray:
    """Load an STL, repair if needed, and rasterize it into a (nx, ny, nz)
    boolean occupancy grid sized to occupy `domain_fraction` of the domain's
    smallest axis. The object is placed at 1/3 along x so there is wake room
    downstream."""
    mesh = trimesh.load(stl_path, force="mesh")

    if not mesh.is_watertight:
        mesh.fill_holes()
        mesh.fix_normals()
        if not mesh.is_watertight:
            raise ValueError(
                f"'{stl_path}' is not watertight and could not be repaired; "
                "voxelization requires a closed surface."
            )

    extents = mesh.extents  # (3,) physical size of the mesh
    domain_shape = np.array([nx, ny, nz], dtype=np.float64)
    target_size = domain_shape.min() * domain_fraction

    max_extent = extents.max()
    if max_extent <= 0:
        raise ValueError(f"'{stl_path}' has degenerate (zero-size) extents.")

    pitch = max_extent / target_size
    if pitch <= 0 or not np.isfinite(pitch):
        raise ValueError(f"'{stl_path}' produced an invalid voxel pitch.")

    voxel = mesh.voxelized(pitch=pitch).fill()
    obj_grid = np.asarray(voxel.matrix, dtype=bool)

    if any(obj_grid.shape[i] > domain_shape[i] for i in range(3)):
        raise ValueError(
            f"Object ({obj_grid.shape}) does not fit inside the requested "
            f"domain ({nx}, {ny}, {nz}) even after scaling to "
            f"domain_fraction={domain_fraction}. Increase domain size, "
            "lower domain_fraction, or use a smaller resolution object."
        )

    grid = np.zeros((nx, ny, nz), dtype=bool)
    ox, oy, oz = obj_grid.shape
    # place object at 1/3 of the way along x, centered in y and z
    x0 = max(int(nx / 3 - ox / 2), 0)
    y0 = max(int(ny / 2 - oy / 2), 0)
    z0 = max(int(nz / 2 - oz / 2), 0)
    grid[x0:x0 + ox, y0:y0 + oy, z0:z0 + oz] = obj_grid

    return grid
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_voxelize.py -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add wind-tunnel/voxelize.py wind-tunnel/tests/test_voxelize.py
git commit -m "Add STL to occupancy grid voxelization"
```

---

### Task 3: lbm.py — D3Q19 Lattice Boltzmann solver core

**Files:**
- Create: `wind-tunnel/lbm.py`
- Test: `wind-tunnel/tests/test_lbm_poiseuille.py`

**Interfaces:**
- Produces:
  - `lbm.C` — `np.ndarray` shape `(19, 3)` int64, D3Q19 velocity set.
  - `lbm.W` — `np.ndarray` shape `(19,)` float64, lattice weights.
  - `lbm.OPPOSITE` — `np.ndarray` shape `(19,)` int, opposite-direction index for each of the 19 directions.
  - `lbm.equilibrium(rho: np.ndarray[nx,ny,nz], u: np.ndarray[3,nx,ny,nz]) -> np.ndarray[19,nx,ny,nz]`
  - `lbm.macroscopic(f: np.ndarray[19,nx,ny,nz]) -> tuple[np.ndarray[nx,ny,nz], np.ndarray[3,nx,ny,nz]]` (rho, u)
  - `lbm.step(f, solid, tau, inlet_rho, inlet_u) -> tuple[f_new, f_post_collision]` — one full LBM iteration (collision, streaming, bounce-back at `solid`, Dirichlet-velocity inlet at x=0, zero-gradient outlet at x=-1). `solid` is `(nx,ny,nz)` bool and must already include any domain-wall cells the caller wants no-slip.
  - `lbm.run_simulation(solid, u_inlet, reynolds, obstacle_length, n_steps, snapshot_interval, output_dir, object_mask=None) -> None` — orchestrates the full time loop; writes `output_dir/step_XXXXXX.npz` (keys `velocity`, `density`) every `snapshot_interval` steps, and if `object_mask` is given, writes `output_dir/forces.csv` (columns `step,Fx,Fy,Fz,Cd,Cl`) every step using `forces.compute_force` (Task 4). Raises `RuntimeError` if velocity becomes non-finite or exceeds 0.5 lattice units/step (numerical divergence).
- Consumes: `forces.compute_force`, `forces.drag_lift_coefficients` (Task 4) — only inside `run_simulation`, not in `step`/`equilibrium`/`macroscopic`, so this task's tests don't need Task 4 to exist yet.

- [ ] **Step 1: Write the failing test**

```python
# wind-tunnel/tests/test_lbm_poiseuille.py
import numpy as np
from lbm import equilibrium, macroscopic, step


def test_equilibrium_matches_macroscopic_at_rest():
    nx, ny, nz = 4, 4, 4
    rho = np.ones((nx, ny, nz))
    u = np.zeros((3, nx, ny, nz))
    feq = equilibrium(rho, u)
    rho2, u2 = macroscopic(feq)
    assert np.allclose(rho2, rho, atol=1e-10)
    assert np.allclose(u2, u, atol=1e-10)


def test_channel_flow_develops_parabolic_profile():
    """Channel with no-slip top/bottom walls, velocity inlet, zero-gradient
    outlet. After enough steps the mid-channel x-slice should show a
    parabolic-like profile: fastest at the center, ~zero at the walls -
    matching the shape (not exact analytical magnitude, since our inlet
    condition isn't a true periodic pressure-driven Poiseuille flow) of
    u(y) = u_max * (1 - (y_rel)^2)."""
    nx, ny, nz = 10, 24, 4
    u_inlet = 0.03
    reynolds = 20.0
    obstacle_length = ny - 2  # channel half-height scale

    solid = np.zeros((nx, ny, nz), dtype=bool)
    solid[:, 0, :] = True
    solid[:, -1, :] = True

    nu = u_inlet * obstacle_length / reynolds
    tau = 3 * nu + 0.5

    rho = np.ones((nx, ny, nz))
    u = np.zeros((3, nx, ny, nz))
    u[0] = u_inlet
    f = equilibrium(rho, u)

    inlet_rho = np.ones((ny, nz))
    inlet_u = np.zeros((3, ny, nz))
    inlet_u[0] = u_inlet

    for _ in range(4000):
        f, _ = step(f, solid, tau, inlet_rho, inlet_u)

    _, u_final = macroscopic(f)
    mid_x = nx // 2
    profile = u_final[0, mid_x, :, nz // 2]  # ux(y) at mid-channel

    fluid_y = np.arange(1, ny - 1)
    sim_profile = profile[1:-1]

    center = (ny - 1) / 2.0
    y_rel = (fluid_y - center) / (center - 1)
    analytic = 1 - y_rel ** 2
    analytic_norm = analytic / analytic.max()

    sim_max = sim_profile.max()
    assert sim_max > 1e-8, "flow did not develop"
    sim_norm = sim_profile / sim_max

    rms_error = np.sqrt(np.mean((sim_norm - analytic_norm) ** 2))
    assert rms_error < 0.15, f"profile not parabolic-like, rms_error={rms_error}"

    # no-slip: walls themselves must be ~stationary
    assert abs(profile[0]) < 0.05 * sim_max
    assert abs(profile[-1]) < 0.05 * sim_max
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_lbm_poiseuille.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'lbm'`

- [ ] **Step 3: Implement lbm.py**

```python
# wind-tunnel/lbm.py
import os
import numpy as np

C = np.array([
    [0, 0, 0],
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
    [1, 1, 0], [-1, -1, 0], [1, -1, 0], [-1, 1, 0],
    [1, 0, 1], [-1, 0, -1], [1, 0, -1], [-1, 0, 1],
    [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, 1],
], dtype=np.int64)

W = np.array([
    1 / 3,
    1 / 18, 1 / 18, 1 / 18, 1 / 18, 1 / 18, 1 / 18,
    1 / 36, 1 / 36, 1 / 36, 1 / 36,
    1 / 36, 1 / 36, 1 / 36, 1 / 36,
    1 / 36, 1 / 36, 1 / 36, 1 / 36,
])

OPPOSITE = np.array([0, 2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 18, 17])

_C_F = C.astype(np.float64)


def equilibrium(rho, u):
    cu = np.einsum('ic,cxyz->ixyz', _C_F, u)
    uu = np.einsum('cxyz,cxyz->xyz', u, u)
    return W[:, None, None, None] * rho[None, ...] * (
        1 + 3 * cu + 4.5 * cu ** 2 - 1.5 * uu[None, ...]
    )


def macroscopic(f):
    rho = f.sum(axis=0)
    u = np.einsum('ic,ixyz->cxyz', _C_F, f) / rho[None, ...]
    return rho, u


def _stream(f):
    out = np.empty_like(f)
    for i in range(19):
        out[i] = np.roll(f[i], shift=tuple(int(v) for v in C[i]), axis=(0, 1, 2))
    return out


def step(f, solid, tau, inlet_rho, inlet_u):
    rho, u = macroscopic(f)
    feq = equilibrium(rho, u)
    f_post = f - (f - feq) / tau

    f_streamed = _stream(f_post)

    f_new = f_streamed.copy()
    for i in range(19):
        f_new[i][solid] = f_post[OPPOSITE[i]][solid]

    f_new[:, 0, :, :] = equilibrium(inlet_rho, inlet_u)
    f_new[:, -1, :, :] = f_new[:, -2, :, :]

    return f_new, f_post


def run_simulation(solid, u_inlet, reynolds, obstacle_length, n_steps,
                    snapshot_interval, output_dir, object_mask=None):
    import forces as forces_mod

    nx, ny, nz = solid.shape
    nu = u_inlet * obstacle_length / reynolds
    tau = 3 * nu + 0.5

    rho = np.ones((nx, ny, nz))
    u = np.zeros((3, nx, ny, nz))
    u[0] = u_inlet
    f = equilibrium(rho, u)

    inlet_rho = np.ones((ny, nz))
    inlet_u = np.zeros((3, ny, nz))
    inlet_u[0] = u_inlet

    os.makedirs(output_dir, exist_ok=True)

    frontal_area = None
    forces_path = None
    if object_mask is not None:
        frontal_area = float(np.any(object_mask, axis=0).sum())
        forces_path = os.path.join(output_dir, "forces.csv")
        with open(forces_path, "w") as fh:
            fh.write("step,Fx,Fy,Fz,Cd,Cl\n")

    for stepno in range(n_steps):
        f_new, f_post = step(f, solid, tau, inlet_rho, inlet_u)

        _, u_check = macroscopic(f_new)
        if not np.all(np.isfinite(u_check)) or np.max(np.abs(u_check)) > 0.5:
            raise RuntimeError(
                f"시뮬레이션 발산 (step {stepno}). "
                "해상도를 낮추거나 유입속도(u_inlet)를 낮추세요."
            )

        if object_mask is not None:
            fx, fy, fz = forces_mod.compute_force(f_post, f_new, object_mask, C, OPPOSITE)
            cd, cl = forces_mod.drag_lift_coefficients(
                fx, fz, rho0=1.0, u_inlet=u_inlet, frontal_area=frontal_area
            )
            with open(forces_path, "a") as fh:
                fh.write(f"{stepno},{fx},{fy},{fz},{cd},{cl}\n")

        if stepno % snapshot_interval == 0:
            rho_s, u_s = macroscopic(f_new)
            np.savez(
                os.path.join(output_dir, f"step_{stepno:06d}.npz"),
                velocity=u_s, density=rho_s,
            )

        f = f_new
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_lbm_poiseuille.py -v`
Expected: PASS (2 tests). If `test_channel_flow_develops_parabolic_profile` is flaky on `rms_error`, first check whether `u_inlet`/`reynolds` push `tau` below 0.55 (near-instability) before loosening the threshold.

- [ ] **Step 5: Commit**

```bash
git add wind-tunnel/lbm.py wind-tunnel/tests/test_lbm_poiseuille.py
git commit -m "Add D3Q19 Lattice Boltzmann solver core"
```

---

### Task 4: forces.py — drag/lift via momentum exchange

**Files:**
- Create: `wind-tunnel/forces.py`
- Test: `wind-tunnel/tests/test_forces.py`

**Interfaces:**
- Produces:
  - `forces.compute_force(f_post_collision, f_after_bc, object_mask, C, OPPOSITE) -> tuple[float, float, float]` (Fx, Fy, Fz) in lattice units, computed only over links where a fluid node is adjacent to `object_mask` (so domain walls, even though they're also `solid` in `lbm.step`, don't contribute — pass the object-only mask here, not the wall-inclusive one).
  - `forces.drag_lift_coefficients(fx, fz, rho0, u_inlet, frontal_area) -> tuple[float, float]` (Cd, Cl) via `Cd = fx / (0.5*rho0*u_inlet**2*frontal_area)`, `Cl = fz / (0.5*rho0*u_inlet**2*frontal_area)`.
- Consumes: `lbm.C`, `lbm.OPPOSITE` (passed in by caller, not imported directly, to keep this module standalone/testable without a full solver run).

- [ ] **Step 1: Write the failing test**

```python
# wind-tunnel/tests/test_forces.py
import numpy as np
from lbm import C, OPPOSITE, equilibrium
from forces import compute_force, drag_lift_coefficients


def test_compute_force_nonzero_against_single_solid_cube():
    nx, ny, nz = 8, 8, 8
    solid = np.zeros((nx, ny, nz), dtype=bool)
    solid[4, 4, 4] = True  # single solid cell in the middle

    rho = np.ones((nx, ny, nz))
    u = np.zeros((3, nx, ny, nz))
    u[0] = 0.05  # uniform flow in +x

    f_post = equilibrium(rho, u)
    # simulate what bounce-back would produce at the solid cell: reversed
    # populations swapped in from the opposite direction
    f_after_bc = f_post.copy()
    for i in range(19):
        f_after_bc[i][solid] = f_post[OPPOSITE[i]][solid]

    fx, fy, fz = compute_force(f_post, f_after_bc, solid, C, OPPOSITE)

    assert fx > 0, "flow in +x against an obstacle should push it in +x"
    assert np.isfinite(fx) and np.isfinite(fy) and np.isfinite(fz)


def test_drag_lift_coefficients_basic():
    cd, cl = drag_lift_coefficients(fx=1.0, fz=0.5, rho0=1.0, u_inlet=0.1, frontal_area=4.0)
    assert cd == 1.0 / (0.5 * 1.0 * 0.01 * 4.0)
    assert cl == 0.5 / (0.5 * 1.0 * 0.01 * 4.0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_forces.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'forces'`

- [ ] **Step 3: Implement forces.py**

```python
# wind-tunnel/forces.py
import numpy as np


def compute_force(f_post_collision, f_after_bc, object_mask, C, OPPOSITE):
    force = np.zeros(3)
    for i in range(19):
        ci = C[i]
        if ci[0] == 0 and ci[1] == 0 and ci[2] == 0:
            continue
        shifted_solid = np.roll(object_mask, shift=tuple(int(v) for v in ci), axis=(0, 1, 2))
        link_mask = shifted_solid & (~object_mask)
        if not link_mask.any():
            continue
        f_i = f_post_collision[i][link_mask]
        f_opp = f_after_bc[OPPOSITE[i]][link_mask]
        force += ci.astype(np.float64) * np.sum(f_i + f_opp)
    return float(force[0]), float(force[1]), float(force[2])


def drag_lift_coefficients(fx, fz, rho0, u_inlet, frontal_area):
    denom = 0.5 * rho0 * u_inlet ** 2 * frontal_area
    return fx / denom, fz / denom
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_forces.py -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add wind-tunnel/forces.py wind-tunnel/tests/test_forces.py
git commit -m "Add momentum-exchange drag/lift force computation"
```

---

### Task 5: visualize.py — 3D rendering, animation, force plot

**Files:**
- Create: `wind-tunnel/visualize.py`
- Test: `wind-tunnel/tests/test_visualize.py`

**Interfaces:**
- Produces:
  - `visualize.render_animation(snapshot_dir: str, output_path: str, fps: int = 10) -> None` — loads all `step_*.npz` files in `snapshot_dir` in order, renders a PyVista scene per frame (velocity-magnitude volume + streamlines seeded from the inlet plane) off-screen, writes an animated GIF to `output_path`.
  - `visualize.plot_forces(forces_csv: str, output_path: str) -> None` — reads `forces.csv` (columns `step,Fx,Fy,Fz,Cd,Cl`) and writes a Matplotlib PNG with Cd and Cl vs step.
- Consumes: the `.npz` snapshot format and `forces.csv` format defined in Task 3/4 (`velocity` `(3,nx,ny,nz)`, `density` `(nx,ny,nz)`; CSV columns `step,Fx,Fy,Fz,Cd,Cl`).

- [ ] **Step 1: Write the failing test**

```python
# wind-tunnel/tests/test_visualize.py
import os
import numpy as np
from visualize import render_animation, plot_forces


def test_render_animation_produces_gif(tmp_path):
    snap_dir = tmp_path / "snapshots"
    snap_dir.mkdir()
    nx, ny, nz = 6, 6, 6
    for step in range(0, 30, 10):
        velocity = np.random.rand(3, nx, ny, nz) * 0.1
        density = np.ones((nx, ny, nz))
        np.savez(snap_dir / f"step_{step:06d}.npz", velocity=velocity, density=density)

    out_path = tmp_path / "animation.gif"
    render_animation(str(snap_dir), str(out_path))

    assert out_path.exists()
    assert out_path.stat().st_size > 0


def test_plot_forces_produces_png(tmp_path):
    csv_path = tmp_path / "forces.csv"
    with open(csv_path, "w") as fh:
        fh.write("step,Fx,Fy,Fz,Cd,Cl\n")
        for step in range(5):
            fh.write(f"{step},{1.0 + step * 0.01},0.0,{0.1 + step * 0.001},1.5,0.2\n")

    out_path = tmp_path / "forces.png"
    plot_forces(str(csv_path), str(out_path))

    assert out_path.exists()
    assert out_path.stat().st_size > 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_visualize.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'visualize'`

- [ ] **Step 3: Implement visualize.py**

```python
# wind-tunnel/visualize.py
import glob
import os
import numpy as np
import pyvista as pv
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

pv.OFF_SCREEN = True


def _velocity_magnitude(velocity):
    return np.sqrt((velocity ** 2).sum(axis=0))


def render_animation(snapshot_dir: str, output_path: str, fps: int = 10) -> None:
    files = sorted(glob.glob(os.path.join(snapshot_dir, "step_*.npz")))
    if not files:
        raise ValueError(f"No snapshots found in '{snapshot_dir}'")

    plotter = pv.Plotter(off_screen=True)
    plotter.open_gif(output_path, fps=fps)

    for path in files:
        data = np.load(path)
        velocity = data["velocity"]
        nx, ny, nz = velocity.shape[1:]

        grid = pv.ImageData(dimensions=(nx, ny, nz))
        mag = _velocity_magnitude(velocity).transpose(2, 1, 0).ravel(order="C")
        grid.point_data["velocity_magnitude"] = mag

        plotter.clear()
        plotter.add_mesh(grid, scalars="velocity_magnitude", opacity=0.5, cmap="viridis")
        plotter.write_frame()

    plotter.close()


def plot_forces(forces_csv: str, output_path: str) -> None:
    steps, cds, cls_ = [], [], []
    with open(forces_csv) as fh:
        next(fh)  # header
        for line in fh:
            step, fx, fy, fz, cd, cl = line.strip().split(",")
            steps.append(int(step))
            cds.append(float(cd))
            cls_.append(float(cl))

    fig, ax = plt.subplots()
    ax.plot(steps, cds, label="Cd")
    ax.plot(steps, cls_, label="Cl")
    ax.set_xlabel("step")
    ax.set_ylabel("coefficient")
    ax.legend()
    fig.savefig(output_path)
    plt.close(fig)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_visualize.py -v`
Expected: PASS (2 tests). If PyVista's off-screen rendering fails for lack of a display/GL context in this environment, install `xvfb` and prefix the test run with `xvfb-run -a`, or switch `pv.Plotter(off_screen=True)` to use PyVista's built-in software rendering (`pv.start_xvfb()` at module import time) — try `pv.start_xvfb()` first since it's the smaller change.

- [ ] **Step 5: Commit**

```bash
git add wind-tunnel/visualize.py wind-tunnel/tests/test_visualize.py
git commit -m "Add PyVista animation and force-plot visualization"
```

---

### Task 6: run.py — CLI pipeline + end-to-end smoke test

**Files:**
- Create: `wind-tunnel/run.py`
- Test: `wind-tunnel/tests/test_pipeline_smoke.py`

**Interfaces:**
- Produces: `run.simulate(stl_path, nx, ny, nz, reynolds, u_inlet, steps, snapshot_interval, output_dir) -> str` (returns `output_dir`) — combines `voxelize.voxelize_stl`, wraps it with domain-wall solid cells, calls `lbm.run_simulation` with `object_mask` set, then calls `visualize.render_animation` and `visualize.plot_forces`. Also a `if __name__ == "__main__":` CLI using `argparse` with flags `--stl --nx --ny --nz --reynolds --u-inlet --steps --snapshot-interval --output-dir`.
- Consumes: `voxelize.voxelize_stl` (Task 2), `lbm.run_simulation` (Task 3), `visualize.render_animation` / `visualize.plot_forces` (Task 5).

- [ ] **Step 1: Write the failing test**

```python
# wind-tunnel/tests/test_pipeline_smoke.py
import os
import numpy as np
import trimesh
from run import simulate


def test_full_pipeline_on_sphere_smoke(tmp_path):
    sphere = trimesh.creation.icosphere(subdivisions=1, radius=1.0)
    stl_path = tmp_path / "sphere.stl"
    sphere.export(stl_path)

    output_dir = tmp_path / "out"

    result_dir = simulate(
        stl_path=str(stl_path),
        nx=20, ny=12, nz=12,
        reynolds=20.0,
        u_inlet=0.02,
        steps=300,
        snapshot_interval=50,
        output_dir=str(output_dir),
    )

    assert result_dir == str(output_dir)

    forces_csv = os.path.join(output_dir, "forces.csv")
    assert os.path.exists(forces_csv)
    with open(forces_csv) as fh:
        lines = fh.readlines()
    assert len(lines) > 1  # header + at least one data row

    last_line = lines[-1].strip().split(",")
    cd = float(last_line[4])
    assert np.isfinite(cd)
    assert cd != 0.0

    assert os.path.exists(os.path.join(output_dir, "animation.gif"))
    assert os.path.exists(os.path.join(output_dir, "forces.png"))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_pipeline_smoke.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'run'`

- [ ] **Step 3: Implement run.py**

```python
# wind-tunnel/run.py
import argparse
import numpy as np

from voxelize import voxelize_stl
from lbm import run_simulation
from visualize import render_animation, plot_forces


def simulate(stl_path, nx, ny, nz, reynolds, u_inlet, steps,
             snapshot_interval, output_dir):
    object_mask = voxelize_stl(stl_path, nx, ny, nz)

    solid = object_mask.copy()
    solid[:, 0, :] = True
    solid[:, -1, :] = True
    solid[:, :, 0] = True
    solid[:, :, -1] = True

    obstacle_length = float(np.any(object_mask, axis=(0, 2)).sum())  # extent along y
    if obstacle_length <= 0:
        obstacle_length = 1.0

    run_simulation(
        solid=solid,
        u_inlet=u_inlet,
        reynolds=reynolds,
        obstacle_length=obstacle_length,
        n_steps=steps,
        snapshot_interval=snapshot_interval,
        output_dir=output_dir,
        object_mask=object_mask,
    )

    render_animation(output_dir, f"{output_dir}/animation.gif")
    plot_forces(f"{output_dir}/forces.csv", f"{output_dir}/forces.png")

    return output_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="STL 3D wind tunnel simulation (LBM)")
    parser.add_argument("--stl", required=True)
    parser.add_argument("--nx", type=int, default=96)
    parser.add_argument("--ny", type=int, default=48)
    parser.add_argument("--nz", type=int, default=48)
    parser.add_argument("--reynolds", type=float, default=100.0)
    parser.add_argument("--u-inlet", type=float, default=0.05)
    parser.add_argument("--steps", type=int, default=5000)
    parser.add_argument("--snapshot-interval", type=int, default=100)
    parser.add_argument("--output-dir", default="output")
    args = parser.parse_args()

    simulate(
        stl_path=args.stl, nx=args.nx, ny=args.ny, nz=args.nz,
        reynolds=args.reynolds, u_inlet=args.u_inlet, steps=args.steps,
        snapshot_interval=args.snapshot_interval, output_dir=args.output_dir,
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest tests/test_pipeline_smoke.py -v`
Expected: PASS. This test's assertions are a sanity smoke check (Cd is finite and non-zero), not a tight match to Stokes-law drag — the spec's aspiration for a Stokes-range Cd assumes a much finer grid/lower-Re regime than is practical for a fast test; a full-resolution run (`run.py` CLI defaults) is where a physically meaningful Cd should be evaluated by hand.

- [ ] **Step 5: Run the full test suite**

Run: `cd /home/hjk33/workspace/wind-tunnel && pytest -v`
Expected: all tests across all files PASS.

- [ ] **Step 6: Commit**

```bash
git add wind-tunnel/run.py wind-tunnel/tests/test_pipeline_smoke.py
git commit -m "Add CLI pipeline wiring voxelize -> LBM -> visualize"
```

---

## Self-Review Notes

- **Spec coverage:** voxelize (Task 2), LBM solver + BCs + divergence guard (Task 3), forces/Cd/Cl (Task 4), visualization + animation (Task 5), CLI + full pipeline (Task 6) — all spec sections have a task.
- **Adjustments from spec during planning:** the Poiseuille test compares normalized profile *shape* (RMS error vs. analytic parabola) rather than raw analytical magnitude, since the simplified Dirichlet-velocity inlet isn't a true periodic pressure-driven Poiseuille flow. The pipeline smoke test checks Cd is finite/non-zero rather than matching Stokes-law, since that requires a much finer grid than is practical for a fast test. Both are noted inline in their tasks.
- **Type consistency:** `lbm.step` returns `(f_new, f_post)`; `run_simulation` and `forces.compute_force`'s test both use this exact pair. `forces.compute_force` signature `(f_post_collision, f_after_bc, object_mask, C, OPPOSITE)` matches its only two call sites (Task 3's `run_simulation`, Task 4's test). Snapshot `.npz` keys (`velocity`, `density`) and `forces.csv` columns (`step,Fx,Fy,Fz,Cd,Cl`) are identical across Tasks 3, 5, 6.
