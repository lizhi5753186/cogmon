﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CogMon.Services;
using CogMon.Lib.DataSeries;
using CogMon.Lib;
using CogMon.Lib.Graph;
using NLog;
using System.IO;
using Newtonsoft.Json;
using NGinnBPM.MessageBus.Impl;

namespace CogMon.WWW.Controllers
{
    /// <summary>
    /// Data controller is responsible for delivering graph data
    /// it unifies rrd and mongodb databases
    /// </summary>
    public class PerfController : Controller
    {
        public IPerfCounters PerfCounters { get; set; }
        private Logger log = LogManager.GetCurrentClassLogger();

        public ActionResult Update(string id, int value)
        {
            PerfCounters.AddEvent(id, value);
            return new EmptyResult();
        }

        public ActionResult ReadCounter(string id)
        {
            var res = PerfCounters.GetCurrentStats(id, true);
            return new JsonNetResult(res);
        }

        public ActionResult AllCounters()
        {
            return new JsonNetResult(PerfCounters.GetPerfCounterNames());
        }

        public IServiceMessageDispatcher Dispatcher { get; set; }

        public ActionResult CollectDataJob(string jobId)
        {
            var res = Dispatcher.CallService(new CollectServerPerfCounterData { JobId = jobId });
            return Content(Convert.ToString(res));
        }
        
    }
}