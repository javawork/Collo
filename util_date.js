Date.prototype.mmddyyyy = function() {
      return (this.getMonth() + 1) +
      "/" +  this.padZero(this.getDate()) +
      "/" +  this.padZero(this.getFullYear());
};
Date.prototype.yyyymmdd = function() {
      return this.getFullYear()  +
      "/" +  this.padZero((this.getMonth() + 1)) +
      "/" +  this.padZero(this.getDate());
};
Date.prototype.yyyymmdddash = function() {
      return this.getFullYear()  +
      "-" +  this.padZero((this.getMonth() + 1)) +
      "-" +  this.padZero(this.getDate());
};
Date.prototype.yyyymmddINT = function() {
      return this.getFullYear()  +
      this.padZero((this.getMonth() + 1)) +
      this.padZero(this.getDate());
};

Date.prototype.mmddyyyytime = function(){
      return (this.getMonth() + 1) +
      "/" +  this.padZero(this.getDate()) +
      "/" +  this.padZero(this.getFullYear()) +
      " " + this.padZero(this.getHours()) + 
      ":" + this.padZero(this.getMinutes()) + 
      ":" + this.padZero(this.getSeconds());
};
Date.prototype.getLocalDate = function() {
    var newDate = new Date(this.getTime()+this.getTimezoneOffset()*60*1000);

    var offset = this.getTimezoneOffset() / 60;
    var hours = this.getHours();

    newDate.setHours(hours + 24);
//    console.log( "offset", offset, this, hours, newDate );
    return newDate;   
}

Date.prototype.yyyymmddfordb = function() {
   var yyyy = this.getFullYear();
   var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
   var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
   return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd);
};

Date.prototype.yyyymmddfordbUTC = function() {
   var yyyy = this.getUTCFullYear();
   var mm = this.getUTCMonth() < 9 ? "0" + (this.getUTCMonth() + 1) : (this.getUTCMonth() + 1); // getMonth() is zero-based
   var dd  = this.getUTCDate() < 10 ? "0" + this.getUTCDate() : this.getUTCDate();
   return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd);
};

Date.prototype.yyyymmddtime = function(){
      return this.getFullYear()  +
      "/" +  this.padZero((this.getMonth() + 1)) +
      "/" +  this.padZero(this.getDate())+
      " " + this.padZero(this.getHours()) + 
      ":" + this.padZero(this.getMinutes()) + 
      ":" + this.padZero(this.getSeconds());
};
Date.prototype.yyyymmddtimedash = function(){
      return this.getFullYear()  +
      "-" +  this.padZero((this.getMonth() + 1)) +
      "-" +  this.padZero(this.getDate())+
      " " + this.padZero(this.getHours()) + 
      ":" + this.padZero(this.getMinutes()) + 
      ":" + this.padZero(this.getSeconds());
};
Date.prototype.mmddyyyytimedash = function(){
      return this.padZero((this.getMonth() + 1)) +
      "-" +  this.padZero(this.getDate())+
      "-" +  this.getFullYear() + 
      " " + this.padZero(this.getHours()) + 
      ":" + this.padZero(this.getMinutes()) + 
      ":" + this.padZero(this.getSeconds());
};
Date.prototype.yyyymmddtimeUTC = function(){
      return this.getUTCFullYear()  +
      "/" +  this.padZero((this.getUTCMonth() + 1)) +
      "/" +  this.padZero(this.getUTCDate())+
      " " + this.padZero(this.getUTCHours()) + 
      ":" + this.padZero(this.getUTCMinutes()) + 
      ":" + this.padZero(this.getUTCSeconds());
};

Date.prototype.yyyymmddstarttime = function(){
      return this.getFullYear()  +
      "/" +  this.padZero((this.getMonth() + 1)) +
      "/" +  this.padZero(this.getDate())+
      " " + "00:00:00";
};
Date.prototype.yyyymmddendtime = function(){
      return this.getFullYear()  +
      "/" +  this.padZero((this.getMonth() + 1)) +
      "/" +  this.padZero(this.getDate())+
      " " + "23:59:59";
};
Date.prototype.padZero =function (n) {
      n = n + '';
      return n.length >= 2 ? n : new Array(2 - n.length + 1).join('0') + n;
}
Date.prototype.convert = function(d) {
      // Converts the date in d to a date-object. The input can be:
      //   a date object: returned without modification
      //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
      //   a number     : Interpreted as number of milliseconds
      //                  since 1 Jan 1970 (a timestamp) 
      //   a string     : Any format supported by the javascript engine, like
      //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
      //  an object     : Interpreted as an object with year, month and date
      //                  attributes.  **NOTE** month is 0-11.
      return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
      );
}

Date.prototype.compare = function(d){
      //  -1 : if this < d
      //   0 : if this = d
      //   1 : if this > d
      // NaN : if this or d is an illegal date      
      var day = new Date(d);
      return (
            isFinite(a=this.convert(this).valueOf()) &&
            isFinite(b=this.convert(day).valueOf()) ?
            (a>b)-(a<b) :
            NaN
      );
}

var util_date = {
      getToday_yyyymmdd: function(){
      	var today = new Date();
      	return today.yyyymmdd();
      },
      get_yyyymmdd:function(_date){
            if( _date == "" || _date == null || _date == undefined ){
                  return null;
            }else{
                  var date = new Date(_date);
                  return date.yyyymmdd();
            }
      },
      getToday_yyyymmddtime:function(_date){
            if( _date == "" || _date == null || _date == undefined ){
                  return null;
            }else{
                  var date = new Date(_date);
                  return date.yyyymmddtime();
            }
      },
      get_yyyymmddtime:function(_date){
            if( _date == "" || _date == null || _date == undefined ){
                  return null;
            }else{
                  var date = new Date(_date);
                  return date.yyyymmddtime();
            }
      },
      getThisMonday: function(_date){
            var d = new Date(_date);
            var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            return new Date(d.setDate(diff));
      },
      getLastMonday: function(_date){
            var d = this.getThisMonday(_date);
            return this.getNextDay(d,-7);
      },
      getNextMonday: function(_date){
            var d = this.getThisMonday(_date);
            return this.getNextDay(d,7);
      },
      getNextMonth: function(_date){
            var d = new Date(_date);
            if (d.getMonth() == 11) {
                return new Date(d.getFullYear() + 1, 0, 1);
            }
            return new Date(d.getFullYear(), d.getMonth() + 1, 1);
      },
      getNextDay: function(_date, _count){
            var d = new Date(_date);
            d.setDate(d.getDate() + _count);
            return new Date(d);
      },
      getMonday:function(d, weeksago) {
            var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            var monday = new Date(d.setDate(diff));
            monday.setDate( monday.getDate()- 7*weeksago);

            return monday;
      },
      getFirstday: function(d){
            var t = new Date(d);
            return new Date(t.getFullYear(), t.getMonth(), 1);
      },
      getFirstdayOfLastMonth: function(d){
            var t = this.getLastdayOfLastMonth(d,0);
            return new Date(t.getFullYear(), t.getMonth(), 1);
      },
      getLastdayOfLastMonth: function(d, monthsago){
            var t = new Date(d);
            t.setMonth( t.getMonth()-monthsago);
            t = new Date(t.getFullYear(), t.getMonth(), 0);

            return t;
      },
      getLastdayOfThisMonth:function(d){
            var t = new Date(d);
            return new Date(t.getFullYear(), t.getMonth() + 1, 0);
      },
      getFirstdayOfNextMonth: function(d, monthslater){
            // monthslater must be bigger than 0
            var t = this.getLastdayOfThisMonth(d);

            if(monthslater !== undefined){
                  for(var i=0;i<monthslater;i++){
                        t = this.getNextDay(t, 1);
                        t = this.getLastdayOfThisMonth(t);
                  }
            }
            return this.getNextDay(t, 1);
      },
      getDiffDays: function(f , s){
            var date1 = new Date(f);
            var date2 = new Date(s);
            var timediff = Math.abs( date1.getTime() - date2.getTime() );
            return Math.ceil( timediff/(1000*3600*24));
      },
      getDiffWeeks: function(f , s){
            var date1 = new Date(f);
            var date2 = new Date(s);
            var timediff = Math.round( date1.getTime() - date2.getTime() );
            return Math.ceil( timediff/(1000*3600*24*7));
      },
      getDiffMonths: function(f , s){
            var date1 = new Date(f);
            var date2 = new Date(s);
            var months = (date2.getFullYear() - date1.getFullYear()) * 12;
            months -= date1.getMonth() + 1;
            months += date2.getMonth();

            return months <= 0 ? 0:months;
      },
      bThisMonth: function ( d ){
            var today = new Date();
            var date1 = new Date(d);
            if(today.getFullYear() == date1.getFullYear() && today.getMonth() == date1.getMonth())
                  return true;

            return false;
      },
      bFuture: function ( d ){
            var today = new Date();
            var day = new Date(d);
            return (
                  isFinite(a=today.convert(today).valueOf()) &&
                  isFinite(b=today.convert(day).valueOf()) ?
                  (a<=b) : NaN
            );
      },
      bToday: function ( d ){
            var today = new Date();
            var date1 = new Date(d);
            if(today.getFullYear() == date1.getFullYear() && today.getMonth() == date1.getMonth() && today.getDay() == date1.getDay())
                  return true;

            return false;
      },
      bThesedays: function(d){
            var today = new Date();
            var date1 = new Date(d);

            var diff = this.getDiffDays( today, date1);
            if(diff < 5)
                  return true;

            return false;
      }
};

module.exports = util_date;