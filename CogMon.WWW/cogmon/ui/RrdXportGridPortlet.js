//portlet showing a grid with rrd xport data
Ext.define('CogMon.ui.RrdXportGridPortlet', {
    extend: 'CogMon.ui.Portlet',
    requires: [],
    autoRefreshInterval: undefined,
    dataSeriesId: null,
    step: 0,
	setDateRange: function(start, end, suppressNotification) {
        this.setStartTime(start);
        this.setEndTime(end);
		this.loadData();
		//if (!suppressNotification) this.fireEvent('daterangechanged', this, start, end);
    },
    loadData: function() {
        var me = this;
        if (Ext.isEmpty(me.dataSeriesId)) throw "Missing dataSeriesId";
        Ext.Ajax.request({
            url: 'Data/GetData', method: 'GET',
            params: {
                id: me.dataSeriesId,
                startTime: me.getStartTime(),
                endTime: me.getEndTime(),
                step: me.step
            },
            success: function(resp) {
                var rt = Ext.decode(resp.responseText);
                me.loadDataObj(rt);
            },
            failure: function() {
                console.log('fail');
            }
        });
    },
    loadDataObj: function(v) {
        var me = this;
        var flds = [{name: 'T', type: 'int'}, {name: 'Timestamp', type: 'date'}];
        for (var i=0; i<v.DataColumns.length; i++) {
            flds.push({name: 'c' + i, type: 'float'});
        }
        var dt = [];
        for (var j=0; j<v.Rows.length; j++) {
            var r = v.Rows[j];
            var av = [r.T, r.Timestamp];
            dt.push(av.concat(r.V));
        }
        //console.log('DATA: ' + Ext.encode(dt));
        if (Ext.isEmpty(me.gstore)) {
            var gst = Ext.create('Ext.data.ArrayStore', {
                fields: flds, idProperty: 'T',
                data: dt
            });
            var gc = {xtype: 'gridpanel', itemId: 'thegrid',
				emptyText: 'No data in selected date range',
                store: gst,
                columns: [
                    {dataIndex: 'Timestamp', header: 'Time'}
                ],
				autoScroll: true
            };
            for (var i=0; i<v.DataColumns.length; i++) {
                gc.columns.push({dataIndex: 'c' + i, header: v.DataColumns[i]});
            }
            var grid = Ext.create('Ext.grid.Panel', gc);
            me.removeAll();
            me.add(grid);
            me.gstore = gst;
        }
        else {
            me.gstore.loadData(dt);
        }
    },
	setupConfigPropertyGrid: function(gcfg) {
		gcfg = this.callParent(arguments);
		return Ext.apply(gcfg.source, {
			step: 'D'
		});
	},
	applyUpdatedConfig: function(cfg) {
		this.setHeight(cfg.height);
	},
    initComponent: function() {
        var me = this;
		Ext.apply(me, {     
            layout: 'fit',
			tools: [
                {
                    type: 'gear',
                    tooltip: 'Settings',
                    handler: function(event, toolEl, panel) {
						me.showConfigEditor();
                    }
                },
                {
                    type:'refresh',
                    tooltip: 'Refresh',
                    handler: function(event, toolEl, panel){
						//me.gstore.load();
                    }
                }
            ],
			items: []
        });
        if (Ext.isEmpty(me.listeners)) me.listeners = {};        
        this.callParent(arguments);
		this.addEvents( 'daterangechanged', 'configchanged');
        if (!Ext.isEmpty(me.graphDefinitionId)) {
            me.on('show', function() {
                me.loadData();
            });
        }
    },
    alias: 'widget.rrdxportgridportlet'
});