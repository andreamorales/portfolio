<script>
</script>

<div class="big">
  <script
    type="module"
    src="https://unpkg.com/@splinetool/viewer@1.0.59/build/spline-viewer.js"
  ></script>
  <spline-viewer
    url="https://prod.spline.design/N0I7C5vdnvmA7IFB/scene.splinecode"
  ></spline-viewer>
</div>

<div class="small">
  <script
    type="module"
    src="https://unpkg.com/@splinetool/viewer@1.0.61/build/spline-viewer.js"
  ></script>
  <spline-viewer
    url="https://prod.spline.design/UYUod44fPyKEqh0Z/scene.splinecode"
  ></spline-viewer>
</div>

<style>
  .big {
    visibility: hidden;
    position: fixed;
    height: 0%;
    width: 0%;
  }

  .small {
    visibility: visible;
    position: fixed;
    z-index: -2;
    height: 100%;
    width: 100%;
    left: 30%;
    top: 0%;
    filter: blur(1px);
  }

  @media (min-width: 768px) {
    .big {
      visibility: visible;
      position: fixed;
      z-index: -2;
      height: 100%;
      width: 100%;
      left: 30%;
      top: 25%;
      filter: blur(1px);
    }

    .small {
      visibility: hidden;
      height: 0%;
      width: 0%;
    }
  }
</style>
