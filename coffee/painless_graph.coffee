#_require cyto_style.coffee
#_require sparql_text.coffee

class window.PainlessGraph

    
    palette = null
    sparql_text = null
    cur_variable_value = 0


    constructor: ->
        palette = window.palette('sol-accent', 8)
 
        @init()
        @reshape()
        
        sparql_text = new SparqlText(@cy)
        sparql_text.update()


    reshape: =>

        @cy.layout({
            name:'breadthfirst'
            padding: 5
            spacingFactor: 1 
            fit:false
        }).run()

        #for node in @cy.nodes('.node-variable')
            #node.neighborhood('node').layout({
                #name:'circle'
                #boundingBox: {
                    #x1: node.position('x') - 50
                    #y1: node.position('y') - 50
                    #w: 100
                    #h: 100
                #}
            #}).run()


    undo : ->
        console.log "undo"


    merge: = (node1, node2) ->
    ###* merges node1 and node2, repositioning all node2's edges into node1 ###
		for edge in node2.neighborhood('edge')
		
			# if this edge has node2 as target
			if edge.target().id() == node2.id()
				@cy.add({
					group: 'edges'
					data: {
						source: edge.source().id()
						target: node1.id()
					}
				})

			# if this edge has node2 as source
			if edge.source().id() == node2.id()
				@cy.add({
					group: 'edges'
					data: {
						source: node1.id()
						target: edge.target().id()
					}
				})

		# remove node2 with all its connected edges
		@cy.remove(node2) 


    add_link: (link_name, link_type) =>


        if @cy.nodes(":selected").length > 0 and @cy.nodes(":selected").hasClass('node-variable')
            parent = @cy.nodes(":selected")
        else 
            par_id = "x" + cur_variable_value
            
            @cy.add({
                group: 'nodes'
                data: {
                    id: par_id
                    color: '#' + palette[cur_variable_value % palette.length];
                    label: par_id
                }
                classes: 'node-variable'
            })

            parent = @cy.getElementById(par_id)
            sparql_text.add_to_select(par_id)
            cur_variable_value += 1

        range_id = parent.id() + Math.round(Math.random()*1000)
        attr_id = link_name + Math.round(Math.random()*1000)
        dom_id = parent.id() + range_id + "d"
        var_id = "x" + cur_variable_value
        
        if link_type == "concept"
            @cy.add({
                group: 'nodes'
                data: {id: attr_id}
                classes: 'node-concept'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: parent.id()
                    target: attr_id
                }
            })

        else

            @cy.add({
                group: 'nodes'
                data: {id: range_id}
                classes: 'node-range'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: parent.id()
                    target: range_id
                }
            })
            @cy.add({
                group: 'nodes'
                data: {
                    id: attr_id
                    label: link_name
                }
                classes: 'node-attribute'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: range_id
                    target: attr_id
                }
            })
            @cy.add({
                group: 'nodes'
                data: {id: dom_id}
                classes: 'node-domain'
            })
            @cy.add({
                group: 'edges'
                data: {
                    source: attr_id
                    target: dom_id
                }}
            )

            @cy.add({
                group: 'nodes'
                data: {
                    id: var_id
                    color: '#' + palette[cur_variable_value % palette.length];
                    label: var_id
                }
                classes: 'node-variable'
            })

            sparql_text.add_to_select(var_id)
            cur_variable_value += 1
            
            @cy.add({
                group: 'edges'
                data: {
                    source: dom_id
                    target: var_id
                }
            })

        sparql_text.update()
        @reshape()
   

	compute_distance: = (node1, node2) ->
		a = Math.abs(node1.position('x') - node2.position('x'))
		b = Math.abs(node1.position('y') - node2.position('y'))
		return Math.sqrt(a*a + b*b)


	check_collisions: =>
		console.log 'checking collisions'
		for node in @cy.nodes(".node-variable")
        check = false
        for node2 in @cy.nodes(".node-variable")
            if node != node2
                if @compute_distance(node, node2) < 100
                    node.addClass('highlight')
                    node2.addClass('highlight')
                    return [node, node2]
                else
                    node.removeClass('highlight')
 
    
    init: =>
        @cy = new cytoscape(
            container: document.getElementById("query_canvas"),
            style: generate_style()
            wheelSensitivity: 0.5
        )
        @cy.on('click', '.node-variable',
            (event) =>
                event.target.select()
                @reshape()
            )
		@cy.on('mouseup',
			($) => 
				#save_state()
				if @check_collisions() != undefined
					node_tmp_arr = @check_collisions()
					@merge(node_tmp_arr[0], node_tmp_arr[1])
			
				@reshape()
			)
        @cy.resize()
