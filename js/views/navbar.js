var templates = require('../templates');

var _pathwayId = _.uniqueId('pathway_'), _settingsId = _.uniqueId('settings_'), _findId = _.uniqueId('find_'), _saveId = _.uniqueId('save_'), _importId = _.uniqueId('import_'), _layoutId = _.uniqueId('layout_'), _attrListId = _.uniqueId('attrList_');

module.exports = Backbone.View.extend({
    
    initialize: function(options){
        this.options = options;
        
        this.events['click #' + _pathwayId ] = 'onPathwayClick';
        this.events['click #' + _settingsId ] = 'onSettingsClick';
        this.events['keyup #' + _findId ] = 'onFind';
        this.events['click #' + _saveId] = 'onSave';
        this.events['click #' + _importId] = 'onImport';
        this.events['click #' + _layoutId + ' a'] = 'onLayout';
        this.events['click #' + _attrListId + ' a'] = 'onSearchAttrClick';
        
        // Update when graph is ready
        this.listenTo(Backbone, 'layout_changed', this.onLayoutChanged);
        this.listenTo(Backbone, 'got_data', this.onGotData);
    },
    
    events: {
        'change input[name=move]': 'onMoveChange'
    },
    
    render: function(){
        
        var tpl = templates.navbar({
            importId : _importId,
            pathwayId : _pathwayId,
            settingsId : _settingsId,
            findId : _findId,
            saveId : _saveId,
            layoutId : _layoutId,
            attrListId : _attrListId
        });
        $(this.options.el).append(tpl);
    },
    
    onPathwayClick : function(e){
        e.stopPropagation();
        e.preventDefault();
        
        App.views.pathway.render();
    },
    
    onSave : function(e){
        e.stopPropagation();
        e.preventDefault();
        
        Backbone.trigger('save');
    },
    
    onSettingsClick : function(e){
        e.stopPropagation();
        e.preventDefault();
        App.views.side.togglevisible();
    },
    
    onFind : function(e){
        var searchTerm = $('#' + _findId).val();
        var attr = $('#' + _attrListId + ' .glyphicon-ok').parent().text();
        
        var cy = App.views.graph.cy;
        if(cy){
            cy.elements().unselect();
            
            if(searchTerm.length){
                searchTerm = (_.isNaN(+searchTerm)) ? '"' + searchTerm + '"' : +searchTerm;
                cy.elements('[' + attr + ' *= ' + searchTerm + ']').select();
            }
        }      
    },
    
    onImport: function(e){
        e.stopPropagation();
        e.preventDefault();
        
        App.views.import.render();
    },
    
    onLayout: function(e){
        e.preventDefault();
        
        var layout = $(e.target).text().toLowerCase().trim();
        
        if(layout !== 'advanced'){
            App.views.graph.layout({name:layout});
        }else{
            App.views.layout.render();
        }
    },
    
    onLayoutChanged : function(l){
        $('#' + _layoutId + ' a').each(function(){
            var link = $(this);
            var layout = link.text().toLowerCase().trim();
            
            if(layout === l.name){
                link.children().addClass('glyphicon-ok');
            }else{
                link.children().removeClass('glyphicon-ok');
            }
        });
    },
    
    onMoveChange:function(e){
        var val = ($(e.target).val() === 'select') ? true : false;
        App.views.graph.boxSelectionEnabled(val);
    },
    
    onSearchAttrClick : function(e){
        $('#' + _attrListId + ' span').removeClass('glyphicon-ok');
        $(e.target).children().addClass('glyphicon-ok');
    },
    
    onGotData : function(e){
        var attrs = [].concat(App.model.attributes.nodeAttributes, App.model.attributes.edgeAttributes);
        attrs = _.uniq(attrs);
        
        var aStr = '';
        _.each(attrs, function(a, i){
            var cl = (i === 0) ? 'glyphicon-ok' : '';
            aStr += '<li><a href="#">' + a + ' <span class="glyphicon ' + cl + '" aria-hidden="true"></span></a></li>';
        });
        $('#' + _attrListId).html(aStr);
    }
});