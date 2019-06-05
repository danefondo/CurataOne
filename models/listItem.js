const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const listItemSchema = new mongoose.Schema({
	// can also be used as placeholder for images
	listItem: String,
	listItemURL: String,
	listItemContent: String,
	listItemState: String,
	itemDescription: String,
	itemOrder: Number,
	listId: String
});

const listItem = module.exports = mongoose.model('listItem', listItemSchema);


// once I'm done, then I will create music, do art, act, create computer games and whatever else expressive is there to do

// Progress and work today produces results over time by the time memory of it is possibly already gone (of the actions that produce the future's results); and what is producing today's results are not the doings of today but the accumulation of what's occurred in the past.  Compounding is exceptionally powerful.

// In 2 months, 6 months, 10 months -- I won't be able to tell much difference for which work was done during some 'less feel like it day' and work done on  a day I 'felt like it'; the best sit down and do the work and their craft; feelings are to be accepted, surrendered and moved on from so life could be lived.

// The work I do today is the foundation upon which I build on tomorrow. Thus, I aim to build the best ground I can today, so as to have even better footing to continue building more ground on tomorrow. As such, it always makes sense to put in one's best work, as else it comes to pay back in the future. We do not get the most negative consequences nor most positive rewards today or immediately, especially not with the best things, which tend to be achieved over time -- as such, in each moment, in each Now, is the time, always, to give one's all; and this too, is the accumulation of past knowing, and now that there's been great fortune to come this far, I want to take this even further.

// imagine quite a lot of pain pain now or a lot over a long period of time but in small increments

// memento mori

// vivre sans temps mort

// seize the day - carpe diem

// do your best - facere optimum

// and then compete with my own best.


// My life today is the consequence of my choices and decisions so far. And each decision that I make right now is just like that, a decision which will build the now of tomorrow

