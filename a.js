const { faker } = require('@faker-js/faker');

function getRandomTimeOfDay() {
  const startOfDay = new Date();
  startOfDay.setHours(9, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(18, 0, 0, 0);
  const randomTimestamp = new Date(startOfDay.getTime() + Math.random() * (endOfDay.getTime() - startOfDay.getTime()));
  return randomTimestamp;
}

let bulkData = []; 
async function bulkinsert(){
    for (let i = 0; i < 1000; i++) { 
        var datetime= getRandomTimeOfDay()
        let calltype = faker.helpers.arrayElement(['disposed', 'missed', 'autoFail', 'autoDrop']);
        // console.log(calltype)
        let disposeName;
        let disposeType;
            
        if (calltype == 'missed') {
          disposeName = 'agent not found';
        } else if (calltype == "autoFail" || calltype == "autoDrop") {
          disposeName = faker.helpers.arrayElement(["busy", "decline", "does not exist", "not acceptable"]);
        } else {
          disposeName = faker.helpers.arrayElement(['follow up', 'do not call', 'external transfer']);
          if (disposeName == 'follow up') {
            disposeType = 'callback';
          } else if (disposeName == 'do not call') {
            disposeType = 'dnc';
          } else {
            disposeType = 'etx';
          }
        }
        
        var agents=faker.helpers.arrayElement(['pradeep','panda', 'atul', 'sahil', 'rohit', 'akash', 'anupam', 'ajay', 'ayush',])
        var campaign=faker.helpers.arrayElement(['Insuarance', 'sales', 'marketing', 'finance'])
        var process= faker.helpers.arrayElement(['process1', 'process2', 'process3', 'process4', 'process5'])
        var leadid= Math.floor(Math.random() * 10)+1;
        var referenceuuid= faker.string.uuid();
        var customeruuid= faker.string.uuid();
        
        let ringing = 0;
        let transfer = 0;
        let call = 0;
        let mute = 0;
        let conference = 0;
        let hold = 0;
        let disposetime=0;
        
        if (calltype == 'missed' || calltype == 'autoFail' || calltype == 'autoDrop' ) {
          ringing = faker.number.int({ min: 1, max: 10 });
        } else if (calltype == 'disposed') {
          const variables = ['transfer', 'mute', 'conference', 'hold'];
          const selectedVariables = faker.helpers.arrayElements(variables, { min: 2, max: 3 });
          ringing = faker.number.int({ min: 1, max: 10 });
          selectedVariables.forEach(variable => {
            disposetime=Math.floor(Math.random() * 10)+1;
            call = faker.number.int({ min: 1, max: 300 });
            switch (variable) {
              case 'transfer':
                transfer = faker.number.int({ min: 1, max: 300 });
                break;
              case 'mute':
                mute = faker.number.int({ min: 1, max: 300 });
                break;
              case 'conference':
                conference = faker.number.int({ min: 1, max: 300 });
                break;
              case 'hold':
                hold = faker.number.int({ min: 1, max: 300 });
                break;
            }
        });
      var duration = ringing+transfer+call+mute+conference+hold;
    }
    bulkData.push([datetime,calltype, disposeType, disposeName, duration, agents, campaign, process, leadid, referenceuuid, customeruuid, hold, mute, ringing, transfer, conference, call, disposetime]);
}
}
bulkinsert()
// console.log(bulkData)
module.exports=bulkData;