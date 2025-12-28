const Machine = require('../models/Machine');

// @desc    Get all machines (and create defaults if empty)
// @route   GET /api/machines
const getMachines = async (req, res) => {
  try {
    let machines = await Machine.find().sort({ machineNumber: 1 });

    // AUTO-SEED: If no machines exist, create them automatically
    if (machines.length === 0) {
      const defaultMachines = [
        { machineNumber: 'W1', type: 'Washer' },
        { machineNumber: 'W2', type: 'Washer' },
        { machineNumber: 'W3', type: 'Washer' },
        { machineNumber: 'D1', type: 'Dryer' },
        { machineNumber: 'D2', type: 'Dryer' },
        { machineNumber: 'D3', type: 'Dryer' }
      ];
      machines = await Machine.insertMany(defaultMachines);
    }

    res.status(200).json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update machine status (Start/Stop)
// @route   PUT /api/machines/:id
const updateMachineStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expect "Available" or "In Use"
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    machine.status = status;

    // If starting the machine, set the timer
    if (status === 'In Use') {
      machine.startTime = new Date();
      // Simple logic: Default cycle is 45 mins. 
      // In a real app, this would depend on the settings we built earlier.
      const cycleTime = 45 * 60 * 1000; 
      machine.endTime = new Date(machine.startTime.getTime() + cycleTime);
    } else {
      // If stopping, clear the timer
      machine.startTime = null;
      machine.endTime = null;
      machine.currentOrderId = null;
    }

    await machine.save();
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMachines, updateMachineStatus };