﻿Ext.define('CogMon.ui.GraphList', {
    extend: 'Ext.tree.Panel',
	requires: [],
	uses: [],
	refresh: function() {
		this.store.load();
	},
	deleteSelectedPage: function(deleteCallback) {
		var me = this;
		var sid = this.getSelectedNode();
		if (!Ext.isEmpty(sid)) {
			Ext.MessageBox.confirm("Confirm page delete", "Do you want to delete page '" + sid.text + "'?", function(c) {
				if (c != "yes") return;
				RPC.UserGui.DeleteUserPortalPage(sid.id, function(ret, e) {
					if (e.status)
					{
						if (!Ext.isEmpty(deleteCallback)) deleteCallback(sid.id);
						me.refresh();
						me.fireEvent('pagedeleted', me, sid.id);
					}
					else
					{
						Ext.MessageBox.alert("Error", e.message);
					}
				});
			});
		}
	},
	getSelectedNode: function() {
		var sm = this.getSelectionModel();
		if (sm.getCount() == 0) return null;
		var sel = sm.getLastSelected();
		return sel.raw;
	},
	initComponent: function() {
		 var st = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true
            },
            proxy: {
                type: 'direct',
                directFn: RPC.UserGui.GetUserNavigationMenu
            }
        });
        var me = this;
		Ext.apply(me, {
			store: st,
            rootVisible: false,
            hideHeaders: true,
			viewConfig: {
				//plugins: { ptype: 'treeviewdragdrop', enableDrop: false }
			}
		});
        if (Ext.isEmpty(me.listeners)) me.listeners= {};
        Ext.apply(me.listeners, {
                itemclick: function(v, tn, el) {
                    if (!Ext.isEmpty(tn) && !Ext.isEmpty(tn.raw))
                    {
                        if (tn.raw.ntype == "page")
                        {
                            me.fireEvent('portalpageclick', me, tn.raw.id, tn.raw);
                        }
                    }
                },
				itemdblclick: function(v, tn, el) {
                    if (!Ext.isEmpty(tn) && !Ext.isEmpty(tn.raw) && tn.raw.ntype == "page")
                    {
                        me.fireEvent('portalpagedblclick', me, tn.raw.id, tn.raw);
                    }
                }
            });
        this.addEvents('portalpageclick', 'portalpagedblclick', 'portalpagerightclick', 'pagedeleted');
		this.callParent(arguments);
	},
	alias: 'widget.coggraphlist'
});