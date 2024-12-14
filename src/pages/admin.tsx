import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAtom } from "jotai";
import { userInfoAtom } from "@/store/userInfo";
import { useNavigate } from "react-router-dom";
import { useContract } from "@/providers/ContractProvider";

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [newDailyRate, setNewDailyRate] = useState<string>("0");
  const [newPairAddress, setNewPairAddress] = useState<string>("");
  const [newPairName, setNewPairName] = useState<string>("");
  const [newPairPlatform, setNewPairPlatform] = useState<string>("");
  const [newPairWeight, setNewPairWeight] = useState<string>("0");
  const [actionId, setActionId] = useState<string>("");
  const [actionCounter, setActionCounter] = useState<bigint>();
  const [requiredApprovals, setRequiredApprovals] = useState<bigint>();
  const [actionDetails, setActionDetails] = useState<any>();
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);

  const [updatePairAddresses, setUpdatePairAddresses] = useState<string[]>([""]);
  const [updatePairWeights, setUpdatePairWeights] = useState<string[]>(["0"]);

  const { contract, proposeSetDailyRewardRate, proposeAddPair, proposeUpdatePairWeights, approveAction, executeAction } = useContract();
  const [maxWeight, setMaxWeight] = useState<number>();

  useEffect(() => {
    async function loadContractData() {
      if (contract) {
        const counter = await contract.actionCounter();
        const approvals = await contract.REQUIRED_APPROVALS();
        const maxWeight = await contract.MAX_WEIGHT();

        setActionCounter(counter);
        setRequiredApprovals(approvals);
        setMaxWeight(maxWeight);
      }
    }
    loadContractData();
  }, [contract]);

  useEffect(() => {
    async function loadActionDetails() {
      if (contract && actionId) {
        const details = await contract.actions(BigInt(actionId));
        setActionDetails(details);
      }
    }
    loadActionDetails();
  }, [contract, actionId]);

  useEffect(() => {
    if (!userInfo.isAdmin) {
      navigate("/");
    }
  }, [userInfo.isAdmin, navigate]);

  if (!userInfo.isAdmin) {
    return null;
  }

  const handleProposeDailyRate = async () => {
    if (newDailyRate !== "0") {
      try {
        await proposeSetDailyRewardRate(newDailyRate);
      } catch (error) {
        console.error("Error proposing daily rate:", error);
      }
    }
  };

  const handleProposeAddPair = async () => {
    if (newPairAddress && newPairPlatform && newPairName && newPairWeight !== "0") {
      try {
        console.log(maxWeight);

        if (maxWeight && ethers.parseEther(newPairWeight) > maxWeight) {
          alert(`Weight cannot be greater than ${ethers.formatEther(maxWeight)}`);
          return;
        }

        if (!ethers.isAddress(newPairAddress)) {
          alert("Invalid LP token address format");
          return;
        }

        if (new TextEncoder().encode(newPairPlatform).length > 32) {
          alert("Platform name too long (max 32 bytes)");
          return;
        }

        await proposeAddPair(newPairAddress, newPairName, newPairPlatform, newPairWeight);
      } catch (error) {
        console.error("Error proposing new pair:", error);
      }
    }
  };

  const handleAddPairWeight = () => {
    setUpdatePairAddresses([...updatePairAddresses, ""]);
    setUpdatePairWeights([...updatePairWeights, "0"]);
  };

  const handleRemovePairWeight = (index: number) => {
    setUpdatePairAddresses(updatePairAddresses.filter((_, i) => i !== index));
    setUpdatePairWeights(updatePairWeights.filter((_, i) => i !== index));
  };

  const handleProposeUpdateWeights = async () => {
    try {
      // Validate addresses
      const validAddresses = updatePairAddresses.every((addr) => ethers.isAddress(addr));
      if (!validAddresses) {
        alert("Invalid LP token address format");
        return;
      }

      // Validate weights
      if (maxWeight) {
        const validWeights = updatePairWeights.every((weight) => Number(weight) <= Number(maxWeight) && Number(weight) >= 0);

        if (!validWeights) {
          alert(`Weights must be between 0 and ${maxWeight}`);
          return;
        }
      }

      await proposeUpdatePairWeights(updatePairAddresses, updatePairWeights);
    } catch (error) {
      console.error("Error proposing weight updates:", error);
    }
  };

  const handleApproveAction = async () => {
    if (actionId) {
      try {
        await approveAction(Number(actionId));
      } catch (error) {
        console.error("Error approving action:", error);
      }
    }
  };

  const handleExecuteAction = async () => {
    if (actionId) {
      try {
        await executeAction(Number(actionId));
      } catch (error) {
        console.error("Error executing action:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Set Daily Reward Rate</h2>
          <input
            type="number"
            className="w-full p-2 border rounded mb-4"
            value={newDailyRate}
            onChange={(e) => setNewDailyRate(e.target.value)}
            placeholder="New daily rate"
          />
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleProposeDailyRate}
            disabled={newDailyRate === "0"}
          >
            Propose New Rate
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Pair</h2>
          <input
            className="w-full p-2 border rounded mb-4"
            value={newPairAddress}
            onChange={(e) => setNewPairAddress(e.target.value)}
            placeholder="LP Token Address"
          />
          <input
            className="w-full p-2 border rounded mb-4"
            value={newPairName}
            onChange={(e) => setNewPairName(e.target.value)}
            placeholder="LP Token Pair Name"
          />
          <input
            className="w-full p-2 border rounded mb-4"
            value={newPairPlatform}
            onChange={(e) => setNewPairPlatform(e.target.value)}
            placeholder="Platform Name"
          />
          <input
            type="number"
            className="w-full p-2 border rounded mb-4"
            value={newPairWeight}
            onChange={(e) => setNewPairWeight(e.target.value)}
            placeholder="Weight"
          />
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleProposeAddPair}
            disabled={!newPairAddress || !newPairPlatform || newPairWeight === "0"}
          >
            Propose New Pair
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Update Pair Weights</h2>
        {updatePairAddresses.map((address, index) => (
          <div key={index} className="flex gap-4 mb-4">
            <input
              className="flex-grow p-2 border rounded"
              value={address}
              onChange={(e) => {
                const newAddresses = [...updatePairAddresses];
                newAddresses[index] = e.target.value;
                setUpdatePairAddresses(newAddresses);
              }}
              placeholder="LP Token Address"
            />
            <input
              type="number"
              className="w-48 p-2 border rounded"
              value={updatePairWeights[index]}
              onChange={(e) => {
                const newWeights = [...updatePairWeights];
                newWeights[index] = e.target.value;
                setUpdatePairWeights(newWeights);
              }}
              placeholder="Weight"
            />
            <button
              className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100 disabled:opacity-50"
              onClick={() => handleRemovePairWeight(index)}
              disabled={updatePairAddresses.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-100" onClick={handleAddPairWeight}>
            Add Pair
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleProposeUpdateWeights}
            disabled={updatePairAddresses.some((addr) => !addr) || updatePairWeights.some((w) => w === "0")}
          >
            Propose Weight Updates
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Multi-Sig Actions</h2>

        <div className="mb-4">
          <p className="text-gray-600">Total Actions: {actionCounter?.toString()}</p>
          <p className="text-gray-600">Required Approvals: {requiredApprovals?.toString()}</p>
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input
              type="number"
              className="w-full p-2 border rounded mb-4"
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              placeholder="Action ID"
            />
            {actionDetails && (
              <div className="bg-gray-100 p-4 rounded">
                <p>Action Type: {actionDetails.actionType}</p>
                <p>Approvals: {actionDetails.approvals?.toString()}</p>
                <p>Executed: {actionDetails.executed ? "Yes" : "No"}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
              onClick={handleApproveAction}
              disabled={!actionId}
            >
              Approve Action
            </button>
            <button
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
              onClick={handleExecuteAction}
              disabled={!actionDetails || actionDetails.executed || actionDetails.approvals < (requiredApprovals || 0)}
            >
              Execute Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
