<script>
  import RadialChart from "./RadialChart.svelte";
  import { store } from "../assets/store.js";
  import { fade } from "svelte/transition";
  import { transition_out } from "svelte/internal";
  import natureDescriptions from "../../public/lang/en/naturedescription-en.json";

  let activeNature = null;

  function toggleNature(name) {
    activeNature = activeNature === name ? null : name;
  }

  $: strings = $store.strings;
  let imagesSrc = [];
  let winningNature = "";
  let topThreeNatures = [];

  store.subscribe((value) => {
    calculateImages();
  });

  function calculateImages() {
  let max = 0;
  let maxNature = "";
  let maxNatures = [];

  if (store.weightedPoints == null) return;

  let orderedNatures = Object.keys(store.weightedPoints).sort(
    (a, b) => store.weightedPoints[b] - store.weightedPoints[a]
  );

  // NEW
  topThreeNatures = orderedNatures.slice(0, 3).map(nature => ({
    name: nature,
    score: (store.weightedPoints[nature] * 100).toFixed(1)
  }));

  for (let nature of orderedNatures) {
    if (store.weightedPoints[nature] >= max) {
      max = store.weightedPoints[nature];
      maxNature = nature;
      maxNatures.push(maxNature);
    }
  }

  imagesSrc = [];
  winningNature = maxNature;

  if (maxNature.length === 0) return;

  let set = new Set();

  for (let i = 0; i < maxNatures.length; i++) {
    let nature = maxNatures[i];
    let pokemons = $store.natureToPokemon[nature];

    for (let [key, value] of Object.entries(pokemons)) {
      let valueLower = value.toLowerCase();

      if (!set.has(valueLower)) {
        set.add(valueLower);
        imagesSrc.push("img/pokemonicons/" + valueLower + ".png");
      }
    }
  }
}

  function restart() {
    location.reload();
  }

  let doTransition = false;
</script>

{#if !doTransition}
  <section transition:fade class="z-50" on:outroend="{() => restart()}">
    <!-- Using Tailwind CSS, build a grid that divides screen in half. The right grid is vertically divied in other two sections -->
    <div class="grid lg:grid-cols-2 h-screen w-screen">
      <!-- Left grid -->
      <div
        class="bg-black/50 flex flex-col flex-wrap justify-end lg:justify-center items-center pt-2">
        <h1 class="text-white text-box select-none p-0 mb-4 w-[80%] lg:w-[90%]">
          {strings["ResultMessage"]}<br>{winningNature}
        </h1>
        <!-- Row of images -->
        <!--
        <div
          class="flex flex-row flex-wrap justify-center items-center w-[90%] gap-4 pointer-events-none select-none pb-4">
          {#each imagesSrc as source}
            <img
              src="{source}"
              alt=""
              class="w-[25%] rendering-pixelated img-box" />
          {/each}
        </div>
        -->
        <button
          on:click="{() => {
            doTransition = true;
          }}"
          class="text-white select-none text-box p-0 my-4 leading-none lg:h-fit w-[40%] lg:w-[30%] hidden lg:block"
          >{strings["Restart"]}</button>
      </div>
      <!-- Right grid -->
      <div
        class="bg-black/50 flex flex-col flex-wrap justify-start lg:justify-center items-center pb-2">
        <RadialChart class="w-[75%] m-0 p-0" />
        <h1 class="text-white text-box select-none p-0 mb-4 w-[80%] lg:w-[90%]" style="margin-bottom:0px;margin-top:24px;">
          <p class="mb-2" style="margin-bottom:-15px;">Top 3:</p>
          <p style="margin-bottom: 0px;font-size: 16px;">(tap to read description)</p>
        
          <ul class="space-y-1">
            {#each topThreeNatures as nature}
              <li class="relative">
                <span
                  class="nature-popout-trigger"
                  on:click={() => toggleNature(nature.name)}
                style="text-decoration:underline;text-underline-offset: 3px;text-decoration-skip-ink: none;">
                  {nature.name}
                </span>
        
                <span class="opacity-80"> — {nature.score}</span>
              </li>
            {/each}
          </ul>
        </h1>
        
        {#if activeNature}
          <div
            class="nature-overlay"
            on:click={() => activeNature = null}
          >
            <div
              class="nature-popout"
              on:click|stopPropagation
            >
              <button
                class="nature-close"
                on:click={() => activeNature = null}
              >
                ✕
              </button>
        
              <h2 class="nature-title">{activeNature}</h2>
        
              <p>
                {natureDescriptions[activeNature]}
              </p>
            </div>
          </div>
        {/if}
        <button
        on:click="{() => {
          doTransition = true;
        }}"
        class="text-white select-none text-box p-0 my-4 w-[75%] lg:w-[30%] block lg:hidden"
        >{strings["Restart"]}</button>
      </div>
    </div>
  </section>
{:else}
  <section transition:fade>
    <div class="fixed right-0 top-0 w-screen h-screen bg-black"></div>
  </section>
{/if}

<style>
.nature-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9998;

  display: flex;
  align-items: center;
  justify-content: center;
}

.nature-popout {
  position: relative;

  width: min(82vw, 360px);
  max-height: 75vh;
  overflow-y: auto;

  padding: 22px 20px;
  padding-top: 42px;

  border-radius: 16px;

  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);

  color: white;
  font-size: 0.95rem;
  line-height: 1.5;

  box-shadow: 0 0 40px rgba(0,0,0,0.4);
}

.nature-close {
  position: absolute;
  top: 10px;
  right: 12px;

  border: none;
  background: transparent;

  color: white;
  font-size: 1.2rem;

  cursor: pointer;

  opacity: 0.75;
  transition: opacity 0.2s ease;
}

.nature-close:hover {
  opacity: 1;
}
</style>
