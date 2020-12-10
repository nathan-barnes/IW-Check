var IW = window.IW || {};

IW.settings = {
  'minWidth': 3,
  'minHeight': 3,

  'maxWidth': 200,
  'maxHeight': 100,
  'maxScreenHeight': 11.5,

  'minPanelReturn': 0.75,
  'maxPanelReturn': 2,
  'defaultPanelReturn': 1,
  'droplockDepth': 0.75,

  'imageExport_maxSize': 4000,
  'imageExport_resolution': 18  //pixels per hole
}

IW.systemDetails = {
  'angleAnchor': {
    'anchorHeight': 4,
    'anchorWidth': 2,
    'anchorThickness': 0.25,

    'maxAnchorSpacing': 36,
    
    'minAnchorDepth': 1,
    'maxAnchorDepth': 9,
    // Minimum distance from host to back of mullion.
    'minMullionOffset': 0.5, 
    // Minimum distance from nearest external face of mullion to centerline of bolt.
    'minMullionBoltMargin': 0.5, 
    // Minimum distance from front edge of anchor to centerline of bolt.
    'minAnchorBoltMargin': 0.5, 

    'floorOffset': 6,
    'hostMarginTop': 24,
    'hostMarginSides': 48
  },
  'pieAnchor': {
    'anchorHeight': 6,
    'anchorWidth': 6,
    'anchorThickness': 0.25,
    // Structurally active depth of anchor. Depths from host to anchor bolt centerline.
    'minAnchorDepth': 2,
    'maxAnchorDepth': 9,
    // Minimum distance from host to back of mullion.
    'minMullionOffset': 0.5,
    // Minimum distance from nearest external face of mullion to centerline of bolt.
    'minMullionBoltMargin': 0.5,
    // Minimum distance from front edge of anchor to centerline of bolt.
    'minAnchorBoltMargin': 0.5,

    'floorOffset': 24,
    'hostMarginTop': 5,
    'hostMarginSides': 5
  },
  'singleScreen': {
    'postWidth': 4,
    
    'baseWidth': 8,
    'baseThickness': 0.25,

    'panelReturn': 1,
    'floorOffset': 6
  },
  'ceiling': {
    'channelThickness': 0.125,
    'channelWidth': 2,
    'channelHeight': 1,
    'maxChannelSpacing': 72,
    
    'panelReturn': 1,
    'floorOffset': 96
  },
  'flatPanels': {
    'floorOffset': 24
  }
};

// Calculated in and copied from cost spreadsheet. See cell 'mullionDataJson'.
IW.mullionSizes = [
  [36, [1, 1, 0.125], [1, 1, 0.125], [2, 1, 0.125], [2, 1, 0.125], [3, 1, 0.125]], 
  [72, [2, 1, 0.125], [3, 1, 0.125], [3, 1, 0.125], [4, 2, 0.125], [4, 2, 0.125]], 
  [108, [2, 1, 0.125], [4, 2, 0.125], [4, 2, 0.125], [5, 2, 0.25], [5, 2, 0.25]], 
  [138, [3, 1, 0.125], [4, 2, 0.125], [5, 2, 0.25], [5, 2, 0.25], [6, 3, 0.188]]
];

// Calculated in and copied from cost spreadsheet. See cell 'metalDataJson'.
IW.metalInfo = {
  'steel': { 
    'maxWidth': [42, 42, 42, 42, 42],
    'maxHeight': 138,
    'factor': [0.0015, 0.00178, 0.00205, 0.00224, 0.00224]
  }, 
  'stainless-steel': { 
    'maxWidth': [42, 42, 42, 42, 42],
    'maxHeight': 138,
    'factor': [0.0015, 0.00178, 0.00205, 0.00224, 0.00224]
  }, 
  'aluminum': { 
    'maxWidth': [42, 42, 42, 42, 42],
    'maxHeight': 138,
    'factor': [0.00195, 0.00232, 0.00267, 0.00292, 0.00292]
  }, 
  'copper': { 
    'maxWidth': [37, 31, 27, 25, 25],
    'maxHeight': 114,
    'factor': [0.00171, 0.00204, 0.00234, 0.00257, 0.00257]
  }, 
  'zinc': { 
    'maxWidth': [38, 35, 30, 28, 28],
    'maxHeight': 138,
    'factor': [0.00187, 0.00222, 0.00256, 0.0028, 0.0028]
  }
};
