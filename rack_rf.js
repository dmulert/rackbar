let weights = [100, 55, 45, 35, 25, 15, 10, 5, 2.5, 1.25, 1, 0.75, 0.5, 0.25];
let metricWeights = [50, 25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.75, 0.5, 0.25];
let defaultUnchecked = [100, 55, 1.25];
let metricDefaultUnchecked = [50, 25];

function howToRack(weight, barWeight, weights) {
  let toRack = [];
  let left = weight - barWeight;
  let time = 0;
  while (left > 0) {
    let found = false;
    for (let i = 0; i < weights.length; i++) {
      let amt = weights[i] * 2;
      if (amt <= left) {
        left -= amt;
        toRack[time] = weights[i];
        time++;
        found = true;
        break;
      }
    }
    if (!found) {
      toRack = [];
      break;
    }
  }
  return toRack;
}

function outputResultTable() {
  const form = document.forms[0];
  const res = howToRack(
    Number(form.weight.value),
    Number(form.barweight.value)
  );
  const out = document.getElementById("result");
  let outStr = "<table><tr><th>Weights Required</th></tr>";
  for (let i = 0; i < res.length; i++) {
    outStr += `<tr><td>${res[i]}</td></tr>`;
  }
  outStr += "</table>";
  out.innerHTML = outStr;
}

function outputResultList() {
  const form = document.forms[0];
  const res = howToRack(
    Number(form.weight.value),
    Number(form.barweight.value),
    convertFormChecks(form.weightsInc)
  );
  const out = document.getElementById("result");
  let outStr = "<dl><dt>Weights Required</dt></dl><ul>";
  for (let i = 0; i < res.length; i++) {
    outStr += `<li>${res[i]}</li>`;
  }
  outStr += "</ul>";
  out.innerHTML = outStr;
}

function outputResultPre() {
  const form = document.forms[0];
  const res = howToRack(
    Number(form.weight.value),
    Number(form.barweight.value),
    convertFormChecks(form.weightsInc)
  );
  const out = document.getElementById("result");
  let outStr = "<h3>Weights Required</h3><pre>";

  const outA = [];
  for (let i = 0; i < res.length; i++) {
    outA[i] = txtWeight(res[i]);
  }

  let arrMax = 0;
  for (let i = 0; i < outA.length; i++) {
    if (outA[i].length > arrMax) {
      arrMax = outA[i].length;
    }
  }

  for (let i = 0; i < outA.length; i++) {
    const space = repeat(" ", (arrMax - outA[i].length) / 2);
    outStr += `${space}${outA[i]}\n`;
  }
  outStr += "</pre>";
  out.innerHTML = outStr;
}

function outputResultSVG() {
  const form = document.forms[0];
  const res = howToRack(
    Number(form.weight.value),
    Number(form.barweight.value),
    convertFormChecks(form.weightsInc)
  );
  const justBar = Number(form.weight.value) === Number(form.barweight.value);

  d3.select("#svgresult").remove();

  const svg = d3
    .select("#result")
    .append("svg")
    .attr("id", "svgresult")
    .attr("width", 200)
    .attr("height", 650);

  if (!justBar && res.length === 0) {
    /* Not Rackable */
    svg.append("text").attr("x", 10).attr("y", 200).text("Not Rackable!");
  } else {
    const barTop = 50;
    const barBottom = 650;
    const barWidth = 10;
    const barHorizCenter = 100 + barWidth / 2;

    svg
      .append("rect")
      .attr("id", "thebar")
      .attr("width", barWidth)
      .attr("height", barBottom - barTop)
      .attr("x", barHorizCenter - barWidth / 2)
      .attr("y", barTop);

    const scaleWidth = d3.scaleLinear().domain([1.25, 100]).range([50, 300]);
    const plateHeight = 20;

    function drawPlate(svg, y, weight) {
      const plateWidth = scaleWidth(weight);
      const [fillColor, strokeColor, plateClass] = getPlateInfo(weight);
    
      svg
        .append("rect")
        // .attr("class", plateClass)
        .attr("width", plateWidth)
        .attr("height", plateHeight)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 1)
        .attr("x", barHorizCenter - plateWidth / 2)
        .attr("y", y);
    }

    // I have added a weight parameter to the function signature and passed it to the getPlateInfo function to get the correct plate information for the given weight.
    // I also modified the function to use the plateInfo variable instead of fillColor to store the plate information returned from getPlateInfo.
    function drawPlateLabel(svg, x, y, label, weight) {
      const [fillColor, strokeColor, plateClass] = getPlateInfo(weight);
   
      svg
        .append("text")
        .attr("class", plateClass)
        .attr("x", x)
        .attr("y", y)
        .text(label);
    }
    //   This refactored version of the function uses an object to store the information for each weight as key-value pairs.
    //   The keys are the weights and the values are arrays containing the fill color, stroke color, and class for each weight.
    function getPlateInfo(weight) {
      const plateInfo = {
        45: ["Blue", "white", "plateLabel"],
        35: ["Yellow", "white", "plateLabelDark"],
        55: ["Red", "white", "plateLabel"],
        25: ["green", "white", "plateLabel"],
        10: ["white", "black", "plateLabelDark"],
        5: ["black", "white", "plateLabel"],
        2.5: ["black", "white", "plateLabelDark"],
      };

      return plateInfo[weight] || ["silver", "white", "plateLabelDark"];
    }

    function drawPlatePair(svg, y, weight) {
      drawPlate(svg, y, weight);
      drawPlateLabel(svg, barHorizCenter, y + plateHeight - 2, weight);
      drawPlate(svg, barBottom - y, weight);
      drawPlateLabel(
        svg,
        barHorizCenter,
        barBottom - y + plateHeight - 2,
        weight
      );
    }

    var numPlates = res.length;
    for (var plate = 0; plate < numPlates; plate++) {
      var weight = res[plate];
      drawPlatePair(svg, 5 + barTop + plate * 25, weight);
    }
  }
}

function repeat(str, num) {
  return str.repeat(num);
}

function txtWeight(weight) {
  const size = Math.min(weight / 3, 50 / 3) - (String(weight).length + 1 / 2);
  const padding = " ".repeat(size);
  return `[${padding}${weight}${padding}]`;
}

function convertFormChecks(frm) {
  return Array.from(frm)
    .filter((elem) => elem.checked)
    .map((elem) => Number(elem.value));
}

function matchValue(matchMe, textElem) {
  document.getElementById(textElem).value = matchMe.value;
}

function loadValues(
  weights,
  defaultUnchecked,
  defaultBarWeight,
  defaultWeight
) {
  const checksDiv = document.getElementById("weightChecks");
  const checkTemplate =
    '<div class="small-4 cell"><input type="checkbox" name="weightsInc" value="{0}" {1}><label>{0}</label></div>';
  let outStr = '<div class="grid-x grid-margin-x">';

  weights.forEach((weight) => {
    const checked = getChecked(weight, defaultUnchecked);
    outStr += checkTemplate
      .replace(/\{0\}/g, weight)
      .replace(/\{1\}/g, checked ? "checked" : "");
  });

  outStr += "</div>";
  checksDiv.innerHTML = outStr;

  // load saved weight values
  const form = document.forms[0];
  form.barweight.value = getValue("barWeight", defaultBarWeight);
  form.weight.value = getValue("weight", defaultWeight);
}

function getChecked(weight, defaultUnchecked) {
  const checked = window.localStorage.getItem("checked_" + weight);
  if (checked === "true") {
    return true;
  } else if (checked == null) {
    return !defaultUnchecked.includes(weight);
  } else {
    return false;
  }
}

function getValue(key, defaultValue) {
  const value = Number(window.localStorage.getItem(key));
  return value === 0 ? defaultValue : value;
}

function saveValues() {
  const form = document.forms[0];
  const weightChecks = form.weightsInc;
  weightChecks.forEach((check) => {
    window.localStorage.setItem(`checked_${check.value}`, check.checked);
  });

  window.localStorage.setItem("barWeight", form.barweight.value);
  window.localStorage.setItem("weight", form.weight.value);
}

window.onload = function () {
  const isMetric = document.URL.endsWith("metric.html");
  if (isMetric) {
    loadValues(metricWeights, metricDefaultUnchecked, 20, 60);
    weightType = "M";
  } else {
    loadValues(weights, defaultUnchecked, 45, 135);
    weightType = "I";
  }
};

window.onload = function () {
  const isMetric = document.URL.endsWith("metric.html");
  if (isMetric) {
    loadValues(metricWeights, metricDefaultUnchecked, 20, 60);
  } else {
    loadValues(weights, defaultUnchecked, 45, 135);
  }
};

const isMetric = document.URL.endsWith("metric.html");
const weightType = isMetric ? "M" : "I";
