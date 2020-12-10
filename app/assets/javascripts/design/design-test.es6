class TestInterface {
  
  constructor(app, wallApp, system) {
    this.app = app;
    this.wallApp = wallApp;
    this.system = system;
    
    this.placeSearchInput = document.createElement('input');
    this.placeSearch = new google.maps.places.PlacesService(this.placeSearchInput);
    
    let testButton = document.getElementsByClassName("js-excel-test")[0];

    if (testButton) {
      testButton.addEventListener('click', () => {
        modal.open('#test-input-modal');
      });

      let textArea = document.getElementsByClassName("js-test-text")[0];
      
      textArea.value = `{
  "width": [3, 10, 30, 50, 100, 200],
  "height": [3, 10, 30, 50, 100],
  "gridSize": [0.5, 1, 3],
  "gridType": [1],
  "perfShape": [0, 1],
  "panelMaterial": ["anodizedAluminum", "paintedAluminum", "dirtyPennyCopper", "starBlueCopper", "angelHairStainless", "glassBeadStainless", "mirrorStainless", "solanumSteel", "baroqueZinc", "hunterZinc", "roanoZinc", "preweatheredZinc"],
  "system": ["pieAnchor", "angleAnchor", "flatPanels", "singleScreen", "ceiling"],
  "mullionType": ["painted", "anodized"]
}`;

      new Clipboard('.js-run-tests', {
        text: () => {
          let result = '';

          try {
            result = TestSet.CreateAndRun(JSON.parse(textArea.value));
          } catch (error) {
            alert("There was an error in processing your input:\n" + error);
            return '';
          }
          
          modal.close('#test-input-modal');

          return result;
        }
      });
    }
  }


}

class TestSet {
  constructor(inputs) {
    this.inputs = inputs;
  }

  static CreateAndRun(inputs) {
    let set = new TestSet(inputs);

    return set.run(IW.testInterface);
  }
  
  run(environment) {
    const optionsCount = Object.keys(this.inputs).reduce((count, key) => {
      if (typeof this.inputs[key] === 'object') {
        return count * this.inputs[key].length;
      } else {
        return count;
      }
    }, 1);

    if (!window.confirm("Really compile " + optionsCount + " options?")) {
      return '';
    }

    const keys = Object.keys(this.inputs);

    let count = 0,
      excelTests = [],
      state = keys.map((key) => this.inputs[key].length - 1);

    while (count < optionsCount) {
      let test = state.reduce((temp, n, i) => {
        let l = this.inputs[keys[i]].length;
        temp[keys[i]] = this.inputs[keys[i]].slice(l - n - 1, l - n)[0];
        return temp;
      }, {});

      let newTest = this.createTest(test, environment);

      // Add index column before test parameters.
      newTest = count + "\t" + newTest;

      if (!newTest) {
        return '';
      }
      
      excelTests.push(newTest);

      for (let i = state.length - 1; i >= 0; i--) {
        if (state[i] > 0) {
          state[i] -= 1;
          break;
        } else {
          state[i] = this.inputs[keys[i]].length - 1;
        }
      }

      count += 1;
      console.log(count + ' / ' + optionsCount);
    }

    return "Index\t" + IW.pricingParams.join("\t") + "\n" + excelTests.join("\n");
  }
  
  createTest (test, environment) {
    for (let key in test) {
      if (DESIGN.__lookupGetter__(key) !== undefined) {
        if (DESIGN[key] != test[key]) {
          DESIGN[key] = test[key];
        }
      } else {
        console.log('Unknown key: ' + key);
        return false;
      }
    }

    return environment.app.exportParameters(false);
  }
}
