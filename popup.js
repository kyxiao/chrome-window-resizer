const PRESETS = [
  { label: 'MacBook 13"', width: 1440, height: 900 },
  { label: 'MacBook 14"', width: 1512, height: 982 },
  { label: 'MacBook 16"', width: 1728, height: 1117 },
  { label: '1440p', width: 2560, height: 1440 },
  { label: '1600x900', width: 1600, height: 900 },
  { label: '1920x1080', width: 1920, height: 1080 },
  { label: '1366x768', width: 1366, height: 768 },
  { label: '1280x800', width: 1280, height: 800 },
];

const presetsEl = document.getElementById('presets');
const applyBtn = document.getElementById('applyBtn');
const statusEl = document.getElementById('status');
const currentSizeEl = document.getElementById('currentSize');
const customWidthEl = document.getElementById('customWidth');
const customHeightEl = document.getElementById('customHeight');

let activePresetIndex = 0;

function renderPresets() {
  presetsEl.innerHTML = '';
  PRESETS.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn' + (index === activePresetIndex ? ' active' : '');
    btn.innerHTML = `<span class="label">${preset.label}</span><span class="size">${preset.width} x ${preset.height}</span>`;
    btn.addEventListener('click', () => {
      activePresetIndex = index;
      customWidthEl.value = preset.width;
      customHeightEl.value = preset.height;
      renderPresets();
    });
    presetsEl.appendChild(btn);
  });
}

async function getCurrentWindow() {
  return new Promise(resolve => {
    chrome.windows.getCurrent(resolve);
  });
}

async function updateCurrentSize() {
  const win = await getCurrentWindow();
  currentSizeEl.textContent = `${win.width} x ${win.height}`;
}

async function applySize(width, height) {
  if (!width || !height || width < 200 || height < 200) {
    statusEl.textContent = '请输入有效的宽高';
    statusEl.style.color = '#d1242f';
    return;
  }
  try {
    const win = await getCurrentWindow();
    await new Promise((resolve, reject) => {
      chrome.windows.update(win.id, { width, height, state: 'normal' }, (updatedWin) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(updatedWin);
        }
      });
    });
    await updateCurrentSize();
    statusEl.textContent = `已应用 ${width} x ${height}`;
    statusEl.style.color = '#2da44e';
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
  } catch (err) {
    statusEl.textContent = '应用失败: ' + err.message;
    statusEl.style.color = '#d1242f';
  }
}

applyBtn.addEventListener('click', () => {
  const width = parseInt(customWidthEl.value, 10);
  const height = parseInt(customHeightEl.value, 10);
  applySize(width, height);
});

customWidthEl.addEventListener('change', () => { activePresetIndex = -1; renderPresets(); });
customHeightEl.addEventListener('change', () => { activePresetIndex = -1; renderPresets(); });

renderPresets();
customWidthEl.value = PRESETS[activePresetIndex].width;
customHeightEl.value = PRESETS[activePresetIndex].height;
updateCurrentSize();
