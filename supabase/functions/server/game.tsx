import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// CHARACTER ROUTES
// ============================================================================

export async function getCharacter(c: Context) {
  try {
    const userId = c.get("userId");
    const character = await kv.get(`character:${userId}`);

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    return c.json(character);
  } catch (error) {
    console.error("Get character error:", error);
    return c.json({ error: "Failed to get character: " + error.message }, 500);
  }
}

export async function updateCharacter(c: Context) {
  try {
    const userId = c.get("userId");
    const updates = await c.req.json();

    const character = await kv.get(`character:${userId}`);
    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    // Merge updates
    const updatedCharacter = { ...character, ...updates };
    await kv.set(`character:${userId}`, updatedCharacter);

    return c.json(updatedCharacter);
  } catch (error) {
    console.error("Update character error:", error);
    return c.json({ error: "Failed to update character: " + error.message }, 500);
  }
}

// ============================================================================
// QUEST ROUTES
// ============================================================================

export async function getQuests(c: Context) {
  try {
    const userId = c.get("userId");
    const quests = await kv.get(`quests:${userId}`);

    if (!quests) {
      return c.json([]);
    }

    return c.json(quests);
  } catch (error) {
    console.error("Get quests error:", error);
    return c.json({ error: "Failed to get quests: " + error.message }, 500);
  }
}

export async function updateQuest(c: Context) {
  try {
    const userId = c.get("userId");
    const questId = c.req.param("questId");
    const updates = await c.req.json();

    const quests = await kv.get(`quests:${userId}`) || [];
    const questIndex = quests.findIndex((q: any) => q.id === questId);

    if (questIndex === -1) {
      return c.json({ error: "Quest not found" }, 404);
    }

    // Update quest
    quests[questIndex] = { ...quests[questIndex], ...updates };
    await kv.set(`quests:${userId}`, quests);

    return c.json(quests[questIndex]);
  } catch (error) {
    console.error("Update quest error:", error);
    return c.json({ error: "Failed to update quest: " + error.message }, 500);
  }
}

export async function claimQuestReward(c: Context) {
  try {
    const userId = c.get("userId");
    const questId = c.req.param("questId");

    const quests = await kv.get(`quests:${userId}`) || [];
    const quest = quests.find((q: any) => q.id === questId);

    if (!quest) {
      return c.json({ error: "Quest not found" }, 404);
    }

    if (!quest.completed) {
      return c.json({ error: "Quest not completed" }, 400);
    }

    if (quest.progress > quest.required) {
      return c.json({ error: "Quest reward already claimed" }, 400);
    }

    // Get character
    const character = await kv.get(`character:${userId}`);
    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    // Add rewards
    let newExp = character.exp + quest.expReward;
    let newLevel = character.level;
    let newExpToNext = character.expToNext;

    // Check for level up
    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel += 1;
      newExpToNext = Math.floor(newExpToNext * 1.5);
    }

    character.exp = newExp;
    character.level = newLevel;
    character.expToNext = newExpToNext;
    character.gold += quest.goldReward;
    character.crypto += quest.cryptoReward;

    // Mark quest as claimed
    quest.progress = quest.required + 1;

    // Save updates
    await kv.set(`character:${userId}`, character);
    await kv.set(`quests:${userId}`, quests);

    // Create transaction record
    const transactions = await kv.get(`transactions:${userId}`) || [];
    transactions.push({
      id: generateId(),
      userId,
      type: "quest",
      amount: quest.cryptoReward,
      description: quest.title,
      timestamp: new Date().toISOString(),
    });
    await kv.set(`transactions:${userId}`, transactions);

    return c.json({
      character,
      quest,
      rewards: {
        exp: quest.expReward,
        gold: quest.goldReward,
        crypto: quest.cryptoReward,
        leveledUp: newLevel > character.level,
        newLevel,
      },
    });
  } catch (error) {
    console.error("Claim quest reward error:", error);
    return c.json({ error: "Failed to claim reward: " + error.message }, 500);
  }
}

// ============================================================================
// INVENTORY ROUTES
// ============================================================================

export async function getInventory(c: Context) {
  try {
    const userId = c.get("userId");
    const inventory = await kv.get(`inventory:${userId}`);

    if (!inventory) {
      return c.json([]);
    }

    return c.json(inventory);
  } catch (error) {
    console.error("Get inventory error:", error);
    return c.json({ error: "Failed to get inventory: " + error.message }, 500);
  }
}

export async function toggleEquip(c: Context) {
  try {
    const userId = c.get("userId");
    const itemId = c.req.param("itemId");
    const { equipped } = await c.req.json();

    const inventory = await kv.get(`inventory:${userId}`) || [];
    const itemIndex = inventory.findIndex((i: any) => i.id === itemId);

    if (itemIndex === -1) {
      return c.json({ error: "Item not found" }, 404);
    }

    const item = inventory[itemIndex];

    // If equipping, unequip other items of same type
    if (equipped) {
      for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].type === item.type && i !== itemIndex) {
          inventory[i].equipped = false;
        }
      }
    }

    item.equipped = equipped;
    inventory[itemIndex] = item;

    await kv.set(`inventory:${userId}`, inventory);

    return c.json(item);
  } catch (error) {
    console.error("Toggle equip error:", error);
    return c.json({ error: "Failed to toggle equip: " + error.message }, 500);
  }
}

export async function addItem(c: Context) {
  try {
    const userId = c.get("userId");
    const itemData = await c.req.json();

    const inventory = await kv.get(`inventory:${userId}`) || [];
    
    const newItem = {
      id: generateId(),
      userId,
      ...itemData,
      equipped: false,
    };

    inventory.push(newItem);
    await kv.set(`inventory:${userId}`, inventory);

    return c.json(newItem);
  } catch (error) {
    console.error("Add item error:", error);
    return c.json({ error: "Failed to add item: " + error.message }, 500);
  }
}

// ============================================================================
// COMBAT ROUTES
// ============================================================================

export async function processCombatResult(c: Context) {
  try {
    const userId = c.get("userId");
    const { victory, rewards, damage } = await c.req.json();

    const character = await kv.get(`character:${userId}`);
    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    if (victory) {
      // Add rewards
      let newExp = character.exp + rewards.exp;
      let newLevel = character.level;
      let newExpToNext = character.expToNext;

      while (newExp >= newExpToNext) {
        newExp -= newExpToNext;
        newLevel += 1;
        newExpToNext = Math.floor(newExpToNext * 1.5);
      }

      character.exp = newExp;
      character.level = newLevel;
      character.expToNext = newExpToNext;
      character.gold += rewards.gold;
      character.crypto += rewards.crypto;
      character.hp = Math.min(character.hp, character.maxHp);

      // Update combat quest progress
      const quests = await kv.get(`quests:${userId}`) || [];
      for (const quest of quests) {
        if (quest.type === "combat" && !quest.completed && quest.progress < quest.required) {
          quest.progress += 1;
          if (quest.progress >= quest.required) {
            quest.completed = true;
          }
        }
      }
      await kv.set(`quests:${userId}`, quests);

      // Create transaction
      const transactions = await kv.get(`transactions:${userId}`) || [];
      transactions.push({
        id: generateId(),
        userId,
        type: "combat",
        amount: rewards.crypto,
        description: "Combat Victory",
        timestamp: new Date().toISOString(),
      });
      await kv.set(`transactions:${userId}`, transactions);
    } else {
      // Handle defeat
      character.hp = Math.floor(character.maxHp * 0.5);
      character.mp = Math.floor(character.maxMp * 0.5);
    }

    await kv.set(`character:${userId}`, character);

    return c.json({
      character,
      victory,
      leveledUp: victory && newLevel > character.level,
    });
  } catch (error) {
    console.error("Process combat error:", error);
    return c.json({ error: "Failed to process combat: " + error.message }, 500);
  }
}

// ============================================================================
// TRANSACTION ROUTES
// ============================================================================

export async function getTransactions(c: Context) {
  try {
    const userId = c.get("userId");
    const transactions = await kv.get(`transactions:${userId}`);

    if (!transactions) {
      return c.json([]);
    }

    return c.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    return c.json({ error: "Failed to get transactions: " + error.message }, 500);
  }
}

// ============================================================================
// LOCATION ROUTES
// ============================================================================

export async function travel(c: Context) {
  try {
    const userId = c.get("userId");
    const { locationId } = await c.req.json();

    const character = await kv.get(`character:${userId}`);
    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    // Update location and restore HP/MP
    character.currentLocation = locationId;
    character.hp = character.maxHp;
    character.mp = character.maxMp;

    await kv.set(`character:${userId}`, character);

    // Update exploration quest
    const quests = await kv.get(`quests:${userId}`) || [];
    for (const quest of quests) {
      if (quest.type === "exploration" && !quest.completed) {
        const uniqueLocations = new Set([1, locationId]);
        const newProgress = uniqueLocations.size;
        quest.progress = Math.max(quest.progress, newProgress);
        if (quest.progress >= quest.required) {
          quest.completed = true;
        }
      }
    }
    await kv.set(`quests:${userId}`, quests);

    return c.json({ character });
  } catch (error) {
    console.error("Travel error:", error);
    return c.json({ error: "Failed to travel: " + error.message }, 500);
  }
}
