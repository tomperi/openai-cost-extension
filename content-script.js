const pricing = {
  "text-davinci": {
    "prompt": 0.03,
    "completion": 0.06 
  },
  "gpt-3.5-turbo-0301": {
    "prompt": 0.002,
    "completion": 0.002 
  },
  "text-embedding-ada-002-v2": {
    "prompt": 0.0004,
    "completion": 0.0004
  }
}

function displayFloat(number, precision = 4) {
  return parseFloat(number.toFixed(precision));
}

function calculateModelCost(model, prompt, completion) {
  const modelPricing = pricing[model];
  if (!modelPricing) {
    return null;
  }

  return {
    promptCost: prompt * modelPricing.prompt / 1000, 
    completionCost: completion * modelPricing.completion / 1000
  };
}

function extractModelName(str) {
  return str?.split(',')[0];
}

function extractTokens(str) {
  const usage = str.match(/\d+/g).map(Number);
  return { prompt: usage[0], completion: usage[1] };
}

function addCostEstimate() {
  const className = 'usage-row';
  const elements = document.getElementsByClassName(className);

  for (const element of elements) {
    if (!element.querySelector('.cost-estimate')) {
      const currentElement = element;
      
      const model = extractModelName(currentElement.querySelector('.num-requests')?.textContent)
      const usageElement = currentElement.querySelector('.body-small')
      const usage = extractTokens(usageElement.textContent);
      const cost = calculateModelCost(model, usage.prompt, usage.completion);

      usageElement.textContent = `${usageElement.textContent}, estimated cost: ${displayFloat(cost.promptCost + cost.completionCost)}$`;

      const costElement = document.createElement('div');
      costElement.classList.add('cost-estimate');
      element.appendChild(costElement);
    }
  }
}


function observeChanges() {
  const targetNode = document.querySelector('.usage-table');

  if (!targetNode) {
    setTimeout(observeChanges, 1000); // Retry in 1 second
    return;
  }

  const config = { childList: true, subtree: true };

  const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        addCostEstimate();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

function init() {
  addCostEstimate();
  observeChanges();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
