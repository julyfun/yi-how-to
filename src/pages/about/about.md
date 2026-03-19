---
donate: false
comment: false
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap');
.cv { max-width: 720px; font-family: "Source Sans 3", "Source Sans Pro", sans-serif; color: inherit; line-height: 1.7; }
.cv h1 { font-size: 2em; font-weight: 700; margin: 0 0 0.2rem; letter-spacing: 0.02em; }
.cv .subtitle { color: #666; margin-bottom: 1.6rem; }
.cv section { margin-bottom: 2rem; }
.cv h2 { font-weight: 400; letter-spacing: 0.02em; border-bottom: 1px solid currentColor; padding-bottom: 0.25rem; margin-bottom: 1rem; opacity: 0.85; }
.cv .entry { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem; }
.cv .entry-main { flex: 1; }
.cv .entry-title { font-weight: 600; }
.cv .entry-sub { opacity: 0.75; }
.cv .entry-date { white-space: nowrap; opacity: 0.65; }
.cv .award-row { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: 0.2rem 0; }
.cv .award-name { flex: 1; }
.cv .award-level { font-weight: 600; color: #b8860b; white-space: nowrap; }
.cv .award-date { opacity: 0.6; white-space: nowrap; }
.cv .skills-grid { display: grid; grid-template-columns: 7rem 1fr; gap: 0.4rem 1rem; }
.cv .skills-label { font-weight: 600; opacity: 0.75; }
.cv blockquote { border-left: 3px solid #aaa; margin: 0 0 0; padding: 0.6rem 1rem; opacity: 0.85; }
.cv .paper { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: flex-start; }
.cv .paper-thumb { width: 160px; flex-shrink: 0; border-radius: 4px; overflow: hidden; }
.cv .paper-thumb img { width: 100%; height: auto; display: block; }
.cv .paper-body { flex: 1; }
.cv .paper-title { font-weight: 600; }
.cv .paper-desc { opacity: 0.75; margin: 0.1rem 0; }
.cv .paper-authors { opacity: 0.65; }
.cv .paper-links { margin-top: 0.3rem; }
.cv .paper-links a { color: #3b82f6; text-decoration: none; }
.cv .paper-links a:hover { text-decoration: underline; }
.cv .paper-link-sep { opacity: 0.4; margin: 0 0.3rem; }
.cv .paper-link-tba { opacity: 0.5; }
@media (max-width: 540px) { .cv .paper { flex-direction: column; } .cv .paper-thumb { width: 100%; } }
@media (max-width: 540px) {
  .cv .entry, .cv .award-row { flex-direction: column; gap: 0.1rem; }
  .cv .entry-date, .cv .award-date { opacity: 0.5; }
}
</style>

<div class="cv">

<h1>Junjie Fang | 方俊杰</h1>
<p class="subtitle">Graduate Student · MVIG Lab, Shanghai Jiao Tong University</p>

<p>
I am a graduate student in Electronic and Information Engineering at Shanghai Jiao Tong University, affiliated with the MVIG research group under the supervision of Professor Lu Cewu. My research interests lie in artificial intelligence and embodied AI.
</p>

<section>
<h2>Education</h2>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title">M.Eng. · Electronic and Information Engineering</div>
    <div class="entry-sub">Shanghai Jiao Tong University</div>
  </div>
  <div class="entry-date">2025 – Present</div>
</div>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title">B.Eng. · Information Engineering</div>
    <div class="entry-sub">Shanghai Jiao Tong University</div>
  </div>
  <div class="entry-date">2021 – 2025</div>
</div>
</section>

<section>
<h2>Research</h2>

<div class="paper">
  <div class="paper-thumb">
    <img src="https://robo-pocket.github.io/static/images/state_coverage.png" alt="RoboPocket teaser" />
  </div>
  <div class="paper-body">
    <div class="paper-title">RoboPocket: Improve Robot Policies Instantly with Your Phone</div>
    <div class="paper-authors">Junjie Fang*, Wendi Chen*, Han Xue*, Fangyuan Zhou*, Tian Le, Yi Wang, Yuting Zhang, Jun Lv, Chuan Wen, Cewu Lu</div>
    <div class="paper-desc">arXiv 2026</div>
    <div class="paper-links"><a href="https://robo-pocket.github.io" target="_blank">Webpage</a> <span class="paper-link-sep">|</span> <a href="https://arxiv.org/abs/2603.05504" target="_blank">arXiv</a></div>
  </div>
</div>
</section>

<section>
<h2>Projects</h2>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title"><a href="https://github.com/julyfun/rm.cv.fans" target="_blank">rm.cv.fans</a></div>
    <div class="entry-sub">RoboMaster computer vision community resource site</div>
  </div>
  <div class="entry-date">Sep. 2021 – Present</div>
</div>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title">waveshare-realsense-smart-robot</div>
    <div class="entry-sub">Embedded robotics project with Intel RealSense depth sensing</div>
  </div>
  <div class="entry-date">Dec. 2024</div>
</div>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title">robotoy</div>
    <div class="entry-sub">A new fast interpolation method and utilities for robot policy rollout</div>
  </div>
  <div class="entry-date">Feb. 2025</div>
</div>
</section>

<section>
<h2>Experience</h2>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title">Software Development Intern</div>
    <div class="entry-sub">Shanghai Wuji Technology Co., Ltd. · Shanghai</div>
  </div>
  <div class="entry-date">Jun. – Aug. 2024</div>
</div>

<div class="entry">
  <div class="entry-main">
    <div class="entry-title">Head Coach, Informatics Competition</div>
    <div class="entry-sub">SJTU Affiliated High School (Minhang) · Shanghai</div>
  </div>
  <div class="entry-date">Oct. 2022 – Present</div>
</div>
</section>

<section>
<h2>Honors &amp; Awards</h2>

<div class="award-row">
  <span class="award-name">China Collegiate Programming Contest (CCPC), Harbin Regional </span>
  <span class="award-level">Gold Medal (128.44/17)</span>
  <span class="award-date">Nov. 2021</span>
</div>
<div class="award-row">
  <span class="award-name">International Collegiate Programming Contest (ICPC), Asia Regional</span>
  <span class="award-level">Silver Medal (80.56/51)</span>
  <span class="award-date">Oct. 2021</span>
</div>
<div class="award-row">
  <span class="award-name">RoboMaster National Championship (Head of the CV Department)</span>
  <span class="award-level">1st Place</span>
  <span class="award-date">Aug. 2023</span>
</div>
<div class="award-row">
  <span class="award-name">RoboMaster East Regional Championship</span>
  <span class="award-level">3rd Place</span>
  <span class="award-date">Jun. 2022</span>
</div>
<div class="award-row">
  <span class="award-name">SJTU SPEIT Academic Scholarship</span>
  <span class="award-level">–</span>
  <span class="award-date">Jun. 2024</span>
</div>
<div class="award-row">
  <span class="award-name">CCF Certified Software Professional — Advanced (CSP-S)</span>
  <span class="award-level">First Prize</span>
  <span class="award-date">Nov. 2019</span>
</div>
<div class="award-row">
  <span class="award-name">National Olympiad in Informatics in Provinces (NOIP), Zhejiang</span>
  <span class="award-level">First Prize (462.00/562)</span>
  <span class="award-date">Nov. 2018</span>
</div>
</section>

<section>
<h2>Technical Skills</h2>
<div class="skills-grid">
  <span class="skills-label">Languages</span>
  <span>C++, Python, Rust, C, Swift</span>
  <span class="skills-label">Frameworks</span>
  <span>ROS, Unity, PyTorch, Coding Agents</span>
</div>
</section>

</div>