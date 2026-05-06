import { writable } from 'svelte/store';
import { getMaxPoints } from './utils.js';
import { getLanguage } from './utils.js';
export let store = writable({});

let lang = getLanguage();

let baseURL = import.meta.env.BASE_URL

export async function loadData() {
  const [natures, questions, natureToPokemon, natureDescription, strings] = await Promise.all([
    fetch(`${baseURL}lang/${lang}/natures-en.json`).then(res => res.json()),
    fetch(`${baseURL}lang/${lang}/questions-en.json`).then(res => res.json()),
    fetch(`${baseURL}lang/${lang}/naturetopokemon-en.json`).then(res => res.json()),
    fetch(`${baseURL}lang/${lang}/naturedescription-en.json`).then(res => res.json()),
    fetch(`${baseURL}lang/${lang}/strings-en.json`).then(res => res.json()),
  ]);

  return { natures, questions, natureToPokemon, natureDescription, strings };
}

export function initStore(data) {
  store.natures = data.natures;
  store.questions = data.questions;
  store.natureToPokemon = data.natureToPokemon;
  store.natureDescription = data.natureDescription;
  store.strings = data.strings;

  const point = data.natures.reduce((acc, cur) => {
    acc[cur] = 0;
    return acc;
  }, {});

  store.points = point;
  store.maxPoints = getMaxPoints(point, store.questions);
}

const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

export const radialChartConfig = {
  plugins: {
    title: {
      display: true,
      text: "Specialties",
      color: 'rgba(245, 245, 245, 1)',
      font:
      {
        size: 20,
      },
      padding: {
        top: 0,
        bottom: 10,
      },
    },
    legend:
    {
      display: false,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: isMobile
      ? { top: 25, bottom: 30, left: 18, right: 18 }
      : { top: 0, bottom: 0, left: 0, right: 0 },
  },
  scale: {
    ticks: {
      display: false,
      beginAtZero: true,
      max: 90,
    },
    afterTickToLabelConversion: function (scaleInstance) {
      var oldTicks = scaleInstance.ticks;
      scaleInstance.ticks = [oldTicks[0], oldTicks[oldTicks.length - 1]];
    }
  },
  scales: {
    r: {
      angleLines: {
        display: true,
        color: 'rgba(245, 245, 245, 0.25)',
      },
      grid:
      {
        lineWidth: 1.2,
        circular: true,
        color: 'rgba(245, 245, 245, 0.5)',
      },
      ticks: {
        display: false,
        maxTickLimit: 1,
      },
      pointLabels:
      {
        display: true,
        color: 'rgba(245, 245, 245, 0.9)',
        padding: isMobile ? 10 : 10,
        font:
        {
          size: isMobile ? 9 : 11,
        },
        callback: function(label) {
          if (!isMobile) return label;

          const wrapMap = {
            "Cardiothoracic Surgery": ["Cardiothoracic", "Surgery"],
            "Emergency Medicine": ["Emergency", "Medicine"],
            "Internal Medicine": ["Internal", "Medicine"],
            "Obstetrics and Gynecology": ["Obstetrics", "and", "Gynecology"],
            "Infectious Disease": ["Infectious", "Disease"],
            "Trauma Surgery": ["Trauma", "Surgery"],
            "Palliative Care": ["Palliative", "Care"],
          };

          return wrapMap[label] || label;
        },
      },
      suggestedMin: 0,
    },
  },
  elements:
  {
    line: {
      lineBorderWidth: 3,
    },
    point: {
      radius: 0,
      pointBackgroundColor: 'rgba(255, 0, 0, 0)',
      pointBorderWidth: 0,
      pointBorderColor: 'rgba(0, 0, 0, 0)',
      color: 'rgba(0, 0, 0, 0)',
    }
  }
}
