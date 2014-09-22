var SaikuOlapQueryTemplate = {
  "queryModel": {
    "axes": {
      "FILTER": {
        "mdx": null,
        "filters": [],
        "sortOrder": null,
        "sortEvaluationLiteral": null,
        "hierarchizeMode": null,
        "location": "FILTER",
        "hierarchies": [],
        "nonEmpty": false,
      },
      "COLUMNS": {
        "mdx": null,
        "filters": [],
        "sortOrder": null,
        "sortEvaluationLiteral": null,
        "hierarchizeMode": null,
        "location": "COLUMNS",
        "hierarchies": [],
        "nonEmpty": true,
      },
      "ROWS": {
        "mdx": null,
        "filters": [],
        "sortOrder": null,
        "sortEvaluationLiteral": null,
        "hierarchizeMode": null,
        "location": "ROWS",
        "hierarchies": [],
        "nonEmpty": true,
      }
    },
    "visualTotals": false,
    "visualTotalsPattern": null,
    "lowestLevelsOnly": false,
    "details": {
      "axis": "COLUMNS",
      "location": "BOTTOM",
      "measures": []
    },
    "calculatedMeasures": []
  }, 
  "queryType": "OLAP",
  "type": "QUERYMODEL"
};

var SaikuOlapQueryHelper = function(query) {
	this.query = query;
};


SaikuOlapQueryHelper.prototype.model = function() {
	return this.query.model;
};

SaikuOlapQueryHelper.prototype.clearAxis = function(axisName) {
  this.model().queryModel.axes[axisName].hierarchies = [];
};

SaikuOlapQueryHelper.prototype.getHierarchy = function(name) {
  var _searchFunction = function(he) { 
    return (he && he.name == name); 
  };

  for (var axisName in this.model().queryModel.axes) {
      var axis = this.model().queryModel.axes[axisName];
      var hierarchy = _.find(axis.hierarchies, _searchFunction);
      if (hierarchy) {
        return hierarchy;
      }
    }
    return null;
};

SaikuOlapQueryHelper.prototype.moveHierarchy = function(fromAxis, toAxis, hierarchy, position) {
  var h = this.getHierarchy(hierarchy);
  var i = this.model().queryModel.axes[fromAxis].hierarchies.indexOf(h);
  var target = this.model().queryModel.axes[toAxis].hierarchies;
  this.model().queryModel.axes[fromAxis].hierarchies.splice(i,1);
  if (typeof position != "undefined" && position > -1 && target.length > position) {
      target.splice(position, 0, h);
      return;
  } 
  target.push(h);

};

SaikuOlapQueryHelper.prototype.removeHierarchy = function(hierarchy) {
  var h = this.getHierarchy(hierarchy);
  if (!h) {
    return null;
  }
  var axis = this.findAxisForHierarchy(hierarchy);
  if (axis) {
    var i = axis.hierarchies.indexOf(h);
      axis.hierarchies.splice(i,1);  
  }
  return h;
};

SaikuOlapQueryHelper.prototype.findAxisForHierarchy = function(hierarchy) {
  for (var axisName in this.model().queryModel.axes) {
    var axis = this.model().queryModel.axes[axisName];
    if (axis.hierarchies && axis.hierarchies.length > 0) {
      for (var i = 0, len = axis.hierarchies.length; i < len; i++) {
        if (axis.hierarchies[i].name == hierarchy) {
          return axis;
        }
      }
    }
  }
  return null;
};

SaikuOlapQueryHelper.prototype.getAxis = function(axisName) {
  if (axisName in this.model().queryModel.axes) {
    return this.model().queryModel.axes[axisName];
  }
  Saiku.log("Cannot find axis: " + axisName);
};

SaikuOlapQueryHelper.prototype.removeFilter = function(filterable, flavour) {
    if (flavour && filterable.filters.length > 1) {
      var removeIndex = -1;
      for (var i = 0, len = filterable.filters.length; i < len; i++) {
        if (filterable.filters[i].flavour == flavour) {
          removeIndex = i;
        }
      }
      if (removeIndex && removeIndex >= 0) {
        filterable.filters.splice(removeIndex, 0);
      }
    } else {
      filterable.filters = [];
    }
};

SaikuOlapQueryHelper.prototype.includeLevel = function(axis, hierarchy, level, position) {
    var mHierarchy = this.getHierarchy(hierarchy);
    if (mHierarchy) {
      mHierarchy.levels[level] = { name: level };
    } else {
      mHierarchy = { "name" : hierarchy, "levels": { }};
      mHierarchy.levels[level] = { name: level };
    }
    
    var existingAxis = this.findAxisForHierarchy(hierarchy);
    if (existingAxis) {
      this.moveHierarchy(existingAxis.location, axis, hierarchy, position);
    } else {
      var _axis = this.model().queryModel.axes[axis];
      if (_axis) {
        if (typeof position != "undefined" && position > -1 && _axis.hierarchies.length > position) {
          _axis.hierarchies.splice(position, 0, mHierarchy);
          return;
        } 
        _axis.hierarchies.push(mHierarchy);
      } else {
        Saiku.log("Cannot find axis: " + axis + " to include Level: " + level);
      }
    }
};

SaikuOlapQueryHelper.prototype.removeLevel = function(hierarchy, level) {
  hierarchy = this.getHierarchy(hierarchy);
  if (hierarchy && hierarchy.levels.hasOwnProperty(level)) {
    delete hierarchy.levels[level];
  }
};

SaikuOlapQueryHelper.prototype.includeMeasure = function(measure) {
  this.model().queryModel.details.measures.push(measure);
};

SaikuOlapQueryHelper.prototype.removeMeasure = function(name) {
  var measures = this.query.model.queryModel.details.measures;
  var removeMeasure = _.findWhere(measures , { name: name });
  if (removeMeasure && _.indexOf(measures, removeMeasure) > -1) {
    measures = _.without(measures, removeMeasure);
    //console.log(measures);
  }
};

SaikuOlapQueryHelper.prototype.clearMeasures = function() {
  this.model().queryModel.details.measures = [];
};

SaikuOlapQueryHelper.prototype.setMeasures = function(measures) {
  this.model().queryModel.details.measures = measures;
};

SaikuOlapQueryHelper.prototype.addCalculatedMeasure = function(measure) {
  if (measure) {
    this.removeCalculatedMeasure(measure.name);
    this.model().queryModel.calculatedMeasures.push(measure);
  }
};

SaikuOlapQueryHelper.prototype.removeCalculatedMeasure = function(name) {
  var measures = this.model().queryModel.calculatedMeasures;
  var removeMeasure = _.findWhere(measures , { name: name });
  if (removeMeasure && _.indexOf(measures, removeMeasure) > -1) {
    measures = _.without(measures, removeMeasure);
    //console.log(measures);
  }
};

SaikuOlapQueryHelper.prototype.getCalculatedMeasures = function() {
  var ms = this.model().queryModel.calculatedMeasures;
  if (ms) {
    return ms;
  }
  return null;
};



SaikuOlapQueryHelper.prototype.swapAxes = function() {
  var axes = this.model().queryModel.axes;
  var tmpAxis = axes.ROWS;
  tmpAxis.location = 'COLUMNS';
  axes.ROWS = axes.COLUMNS;
  axes.ROWS.location = 'ROWS';
  axes.COLUMNS = tmpAxis;
};

SaikuOlapQueryHelper.prototype.nonEmpty = function(nonEmpty) {
  if (nonEmpty) {
    this.model().queryModel.axes.ROWS.nonEmpty = true;
    this.model().queryModel.axes.COLUMNS.nonEmpty = true;
  } else {
    this.model().queryModel.axes.ROWS.nonEmpty = false;
    this.model().queryModel.axes.COLUMNS.nonEmpty = false;
  }
};




