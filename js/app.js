// Generated by CoffeeScript 1.12.7
(function() {
  var add_role, check_collisions, class_cur_letter, compute_distance, create_highlighting_box, cy, elements, generate_style, init, merge, node_base_size, randomize, reshape, reshape2, save_state, sparql_text, state_buffer, state_buffer_max_length, undo, update_sparql_text;

  node_base_size = 50;

  generate_style = function() {
    return new cytoscape.stylesheet().selector('node').style({
      'background-color': 'black',
      'shape': 'rectangle'
    }).selector('.node-domain').style({
      'background-color': 'black',
      'border-color': 'black',
      'border-style': 'solid',
      'border-width': '2px'
    }).selector('.node-range').style({
      'background-color': 'white',
      'border-color': 'black',
      'border-style': 'solid',
      'border-width': '2px'
    }).selector('.node-attribute').style({
      'shape': 'ellipse',
      'background-color': 'white',
      'border-style': 'solid',
      'border-color': 'black',
      'border-width': '2px',
      'content': 'data(id)'
    }).selector('.node-variable').style({
      'shape': 'ellipse',
      'background-color': 'gray',
      'width': function(ele) {
        return 50 + (ele.neighborhood('edge').length * 50);
      },
      'height': function(ele) {
        return 50 + (ele.neighborhood('edge').length * 50);
      },
      'text-valign': 'center',
      'font-size': '60',
      'color': 'white',
      'text-outline-color': 'black',
      'text-outline-width': '2px',
      'content': 'data(id)'
    }).selector('node.highlight').style({
      'border-color': '#333',
      'border-width': '20px',
      'border-style': 'solid'
    }).selector(':parent').style({
      'background-image': 'resources/background-circle.svg',
      'background-opacity': '0',
      'background-width': '100%',
      'background-height': '100%',
      'shape': 'rectangle',
      'border-color': 'white'
    });
  };

  create_highlighting_box = function(node) {
    var st;
    st = "<div class='highlighting_box' onmouseover=''>" + node.id() + "</div>";
    return st;
  };

  update_sparql_text = function() {
    var j, k, l, len, len1, len2, len3, len4, m, n, node1, node2, node3, node4, node5, ref, ref1, ref2, ref3, ref4, sparql_string;
    sparql_string = "Select * <br> where { <br>";
    ref = cy.nodes(".node-variable");
    for (j = 0, len = ref.length; j < len; j++) {
      node1 = ref[j];
      ref1 = node1.neighborhood(".node-domain");
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        node2 = ref1[k];
        ref2 = node2.neighborhood(".node-attribute");
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          node3 = ref2[l];
          ref3 = node3.neighborhood(".node-range");
          for (m = 0, len3 = ref3.length; m < len3; m++) {
            node4 = ref3[m];
            ref4 = node4.neighborhood(".node-variable");
            for (n = 0, len4 = ref4.length; n < len4; n++) {
              node5 = ref4[n];
              sparql_string += "&emsp;$" + create_highlighting_box(node1) + node2.id() + " " + create_highlighting_box(node5) + "<br>";
            }
          }
        }
      }
    }
    return sparql_text.innerHTML = sparql_string + "}";
  };

  reshape2 = function() {
    var child, j, len, neighbor, neighbor2, par_name, parent, parents, results;
    parents = cy.nodes().parents();
    parents.layout({
      name: 'circle'
    }).run();
    results = [];
    for (j = 0, len = parents.length; j < len; j++) {
      parent = parents[j];
      parent.children().layout({
        name: 'circle'
      }).run();
      results.push((function() {
        var k, len1, ref, results1;
        ref = parent.children();
        results1 = [];
        for (k = 0, len1 = ref.length; k < len1; k++) {
          child = ref[k];
          results1.push((function() {
            var l, len2, ref1, results2;
            ref1 = child.neighborhood('node');
            results2 = [];
            for (l = 0, len2 = ref1.length; l < len2; l++) {
              neighbor = ref1[l];
              neighbor.position('x', child.position('x') + (child.position('x') - parent.position('x')));
              neighbor.position('y', child.position('y') + (child.position('y') - parent.position('y')));
              results2.push((function() {
                var len3, m, ref2, results3;
                ref2 = neighbor.neighborhood('node');
                results3 = [];
                for (m = 0, len3 = ref2.length; m < len3; m++) {
                  neighbor2 = ref2[m];
                  if (neighbor2 !== child) {
                    neighbor2.position('x', neighbor.position('x') + (neighbor.position('x') - child.position('x')));
                    neighbor2.position('y', neighbor.position('y') + (neighbor.position('y') - child.position('y')));
                    if (neighbor2.isOrphan()) {
                      console.log(neighbor2.id());
                      results3.push(par_name = neighbor2.id() + 'p');
                    } else {
                      results3.push(void 0);
                    }
                  } else {
                    results3.push(void 0);
                  }
                }
                return results3;
              })());
            }
            return results2;
          })());
        }
        return results1;
      })());
    }
    return results;
  };

  randomize = function(parent_name) {
    var i, j, new_node_attribute_id, new_node_domain_id, new_node_new_parent_id, new_node_range_id, range, ref, results;
    range = Math.round(Math.random() * (10 - 4) + 4);
    console.log("number of generated nodes: " + range);
    results = [];
    for (i = j = 0, ref = range - 1; j < ref; i = j += 1) {
      new_node_range_id = parent_name + Math.round(Math.random() * 10000) + "r";
      new_node_domain_id = parent_name + Math.round(Math.random() * 10000) + "d";
      new_node_attribute_id = parent_name + Math.round(Math.random() * 10000) + "a";
      new_node_new_parent_id = parent_name + i;
      cy.add({
        group: 'nodes',
        data: {
          id: new_node_range_id,
          parent: parent_name
        },
        classes: 'node-range'
      });
      cy.add({
        group: 'nodes',
        data: {
          id: new_node_attribute_id
        },
        classes: 'node-attribute'
      });
      cy.add({
        group: 'nodes',
        data: {
          id: new_node_domain_id,
          parent: new_node_new_parent_id
        },
        classes: 'node-domain'
      });
      cy.add({
        group: 'edges',
        data: {
          source: new_node_range_id,
          target: new_node_attribute_id
        }
      });
      cy.add({
        group: 'edges',
        data: {
          source: new_node_attribute_id,
          target: new_node_domain_id
        }
      });
      results.push(reshape());
    }
    return results;
  };

  sparql_text = document.getElementById("sparql_text");

  class_cur_letter = "a";

  state_buffer = null;

  state_buffer_max_length = 20;

  elements = {
    nodes: [
      {
        data: {
          id: 'a'
        },
        classes: 'node-variable'
      }
    ]
  };

  cy = new cytoscape({
    container: document.getElementById('cy'),
    elements: elements,
    layout: {
      name: 'cose'
    },
    style: generate_style()
  });

  reshape = function() {
    var parents;
    console.log("reshaping");
    parents = cy.nodes('.node-variable');
    return cy.nodes().layout({
      name: 'circle'
    }).run();
  };

  add_role = function(parent) {
    var attr_id, dom_id, range_id, var_id;
    range_id = parent.id() + Math.round(Math.random() * 1000);
    attr_id = parent.id() + range_id + "a";
    dom_id = parent.id() + range_id + "d";
    var_id = parent.id() + range_id + "p";
    cy.add({
      group: 'nodes',
      data: {
        id: range_id
      },
      classes: 'node-range'
    });
    cy.add({
      group: 'edges',
      data: {
        source: parent.id(),
        target: range_id
      }
    });
    cy.add({
      group: 'nodes',
      data: {
        id: attr_id
      },
      classes: 'node-attribute'
    });
    cy.add({
      group: 'edges',
      data: {
        source: range_id,
        target: attr_id
      }
    });
    cy.add({
      group: 'nodes',
      data: {
        id: dom_id
      },
      classes: 'node-domain'
    });
    cy.add({
      group: 'edges',
      data: {
        source: attr_id,
        target: dom_id
      }
    });
    reshape();
    class_cur_letter += 1;
    cy.add({
      group: 'nodes',
      data: {
        id: class_cur_letter
      },
      classes: 'node-variable'
    });
    return cy.add({
      group: 'edges',
      data: {
        source: dom_id,
        target: class_cur_letter
      }
    });
  };

  compute_distance = function(node1, node2) {
    var a, b;
    a = Math.abs(node1.position('x') - node2.position('x'));
    b = Math.abs(node1.position('y') - node2.position('y'));
    return Math.sqrt(a * a + b * b);
  };

  check_collisions = function() {
    var check, j, k, len, len1, node, node2, ref, ref1;
    ref = cy.nodes(".node-variable");
    for (j = 0, len = ref.length; j < len; j++) {
      node = ref[j];
      check = false;
      ref1 = cy.nodes(".node-variable");
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        node2 = ref1[k];
        if (node !== node2) {
          if (compute_distance(node, node2) < node_base_size) {
            node.addClass('highlight');
            node2.addClass('highlight');
            return [node, node2];
          } else {
            node.removeClass('highlight');
          }
        }
      }
    }
  };

  undo = function(state_buffer) {
    if (state_buffer === null || state_buffer.length < 1) {
      return console.log("no saved states");
    } else {
      cy.json(state_buffer[state_buffer.length - 1]);
      return state_buffer.pop();
    }
  };

  save_state = function() {
    if (state_buffer === null) {
      state_buffer = [];
    }
    if (cy.json() !== state_buffer[state_buffer.length - 1]) {
      state_buffer.push(cy.json());
    }
    if (state_buffer.length >= state_buffer_max_length) {
      return state_buffer.shift();
    }
  };

  merge = function(node1, node2) {

    /** merges node1 and node2, repositioning all node2's edges into node1 */
    var edge, j, len, ref;
    ref = node2.neighborhood('edge');
    for (j = 0, len = ref.length; j < len; j++) {
      edge = ref[j];
      if (edge.target().id() === node2.id()) {
        cy.add({
          group: 'edges',
          data: {
            source: edge.source().id(),
            target: node1.id()
          }
        });
      }
      if (edge.source().id() === node2.id()) {
        cy.add({
          group: 'edges',
          data: {
            source: node1.id(),
            target: edge.target().id()
          }
        });
      }
    }
    return cy.remove(node2);
  };

  cy.on('click', '.node-variable', function($) {
    if (this.isOrphan()) {
      add_role(this);
      return reshape();
    }
  });

  cy.on('mousemove', function($) {
    update_sparql_text();
    return check_collisions();
  });

  cy.on('mouseup', function($) {
    var node_tmp_arr;
    save_state();
    if (check_collisions() !== void 0) {
      node_tmp_arr = check_collisions();
      merge(node_tmp_arr[0], node_tmp_arr[1]);
    }
    return reshape();
  });

  init = function() {
    var button, left_panel;
    left_panel = document.getElementById("config");
    button = document.createElement('button');
    button.innerHTML = 'undo';
    button.onclick = function($) {
      return undo(state_buffer);
    };
    return left_panel.append(button);
  };

  init();

  reshape();

  cy.resize();

}).call(this);
