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
  for (var axisName in this.model().queryModel.axes) {
      var axis = this.model().queryModel.axes[axisName];
      var hierarchy = _.find(axis.hierarchies, function(he) { 
                  return (he && he.name == name); 
              });
      if (hierarchy) {
        return hierarchy;
      }
    };
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

SaikuOlapQueryHelper.prototype.removeHierarchy = function(fromAxis, hierarchy) {
  var h = this.getHierarchy(hierarchy);
  var i = this.model().queryModel.axes[fromAxis].hierarchies.indexOf(h);
  this.model().queryModel.axes[fromAxis].hierarchies.splice(i,1);
};



SaikuOlapQueryHelper.prototype.includeLevel = function(axis, hierarchy, level) {
    var mHierarchy = this.getHierarchy(hierarchy);
    if (mHierarchy) {
      mHierarchy.levels[level] = { name: level };
    } else {
      if (axis) {
        var _axis = this.model().queryModel.axes[axis];
        if (_axis) {
              var h = { "name" : hierarchy, "levels": { }};
              h.levels[level] = { name: level };
              _axis.hierarchies.push(h);
        } else {
          Saiku.log("Cannot find axis: " + axis + " to include Level: " + level);
        }
      } else {
        Saiku.log("You need to provide an axis to include new hierarchy: " + hierarchy + " to include Level: " + level);
      }
    }
};

SaikuOlapQueryHelper.prototype.removeLevel = function(hierarchy, level) {
  var hierarchy = this.getHierarchy(hierarchy);
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


SaikuOlapQueryHelper.prototype.swapAxes = function() {
  var axes = this.model().queryModel.axes;
  var tmpAxis = axes['ROWS'];
  tmpAxis.location = 'COLUMNS';
  axes['ROWS'] = axes['COLUMNS'];
  axes['ROWS'].location = 'ROWS';
  axes['COLUMNS'] = tmpAxis;
};

SaikuOlapQueryHelper.prototype.nonEmpty = function(nonEmpty) {
  if (nonEmpty) {
    this.model().queryModel.axes['ROWS'].nonEmpty = true;
    this.model().queryModel.axes['COLUMNS'].nonEmpty = true;
  } else {
    this.model().queryModel.axes['ROWS'].nonEmpty = false;
    this.model().queryModel.axes['COLUMNS'].nonEmpty = false;
  }

}




