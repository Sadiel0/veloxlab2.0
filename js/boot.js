/* Runs before first paint: lets CSS know scripts are on, with a safety net
   so the hero never stays hidden if a later script fails. */
document.documentElement.classList.add("js");
setTimeout(function () { document.documentElement.classList.add("is-loaded"); }, 2500);
