// Finals logic - Pure business logic functions for finals management
import { generateUniqueId, sortPlayers, shuffleArray } from './scripts/utils.js';
import { displayFinalsBracketSetupPopup } from './UI/UI-finals.js';

// Compute recommended group sizes directly — no JSON file needed.
//
// Rules:
//   - Group A: 50–80% of total players; Group B gets the rest
//   - Walkovers only in round 1 (n%3 walkovers, always 0–2, never >3)
//   - Prefer courts of 3; fall back to courts of 2
//   - Each group must be able to play all rounds down to 2 finalists without any further walkovers
//
// A group of n players is valid when:
//   Round 1 produces  floor(n/3)*2 + (n%3)  advancing players (n%3 walkovers)
//   and those advancing players can reach 2 using only courts of 3 or courts of 2.
export async function getRecommendedFinalsGroupSizes(totalPlayers) {
    // Can this count reach 2 finalists using only courts of 3 or 2 (no walkovers)?
    function canReachTwo(n) {
        if (n === 2 || n === 4) return true;
        if (n < 2) return false;
        if (n % 3 === 0) return canReachTwo(Math.floor(n / 3) * 2);
        if (n % 2 === 0) return canReachTwo(n / 2);
        return false;
    }

    // Group size n is valid if after round-1 (with walkovers) the rest needs no walkovers
    function isValidGroupSize(n) {
        if (n < 2) return false;
        const advancing1 = Math.floor(n / 3) * 2 + (n % 3);
        return canReachTwo(advancing1);
    }

    const recommendations = [];

    // Single-group option (all players in A, no B)
    if (isValidGroupSize(totalPlayers)) {
        recommendations.push({
            A: totalPlayers,
            B: 0,
            walkoversA: totalPlayers % 3,
            walkoversB: 0
        });
    }

    // Two-group options: A gets 50–80%, B gets the rest
    const minA = Math.ceil(totalPlayers * 0.5);
    const maxA = Math.floor(totalPlayers * 0.8);

    for (let sizeA = maxA; sizeA >= minA; sizeA--) {
        const sizeB = totalPlayers - sizeA;
        if (sizeB >= 2 && isValidGroupSize(sizeA) && isValidGroupSize(sizeB)) {
            recommendations.push({
                A: sizeA,
                B: sizeB,
                walkoversA: sizeA % 3,
                walkoversB: sizeB % 3
            });
        }
    }

    console.log("Recommended group sizes for " + totalPlayers + " players: ", recommendations);
    return recommendations;
}

 // Load finals structure from JSON based on player count
export async function getFinalsStructure(totalPlayers) {
    try {
        const response = await fetch('./finals_structure_detailed.json');
        const data = await response.json();
        return data.find(s => s.totalPlayers === totalPlayers);
    } catch (error) {
        console.error('Error loading finals structure:', error);
        return null;
    }
}

/**
 * Create seeding pools based on structure and player rankings
 * @param {Array} players - Array of player objects
 * @param {Object} structure - Finals structure object
 * @param {Object} roundStructure - Specific round structure to use
 * @returns {Array} - Array of player pools
 */
export function createSeedingPools(players, structure, roundStructure = null) {
    // Sort players
    const sortedPlayers = sortPlayers(players);

    const playerCount = sortedPlayers.length;
    let poolCount;
    
    // Use provided round structure or default to first round
    const targetRound = roundStructure || structure.rounds[0];
    
    // Determine number of pools based on structure (check if 3 players per court in target round)
    const hasThreePlayerCourts = targetRound.courts && targetRound.courts.some(court => court.players === 3);
    
    if (hasThreePlayerCourts) {
        poolCount = 3; // Use 3 pools when there are 3-player courts
    } else {
        poolCount = 2; // Use 2 pools for standard 2-player courts
    }

    const pools = Array.from({ length: poolCount }, () => []);
    
    // For 2-player courts: put top half in pool 1, bottom half in pool 2
    // For 3-player courts: distribute evenly across 3 pools
    const playersPerPool = Math.ceil(playerCount / poolCount);
    
    sortedPlayers.forEach((player, index) => {
        const poolIndex = Math.floor(index / playersPerPool);
        pools[poolIndex].push(player);
    });

    return pools;
}

// Function to handle drawing the finals bracket for a specific group
export function drawFinalsForGroup(tournament, groupName) {
    console.log(`Drawing finals for group ${groupName}`);
    
    // Get ALL players in the specified group (including eliminated ones for structure calculation)
    const allPlayersInGroup = tournament.getPlayers().filter(player => 
        player.finalsGroup === groupName
    );
    
    // Get only active (non-eliminated) players for the actual draw
    const activePlayers = allPlayersInGroup.filter(player => 
        player.eliminated == null
    );
    
    // Use the ORIGINAL group size for structure determination
    let originalPlayerCount;
    if (tournament.finalsGroupSizes && tournament.finalsGroupSizes[groupName]) {
        originalPlayerCount = tournament.finalsGroupSizes[groupName];
    } else {
        // Fallback to all players in group if no stored size
        originalPlayerCount = allPlayersInGroup.length;
    }
    
    const activePlayerCount = activePlayers.length;
    
    if (activePlayerCount === 0) {
        alert(`Ingen spillere igjen i gruppe ${groupName}`);
        return;
    }
    
    // Load finals structure based on ORIGINAL player count, not remaining players
    getFinalsStructure(originalPlayerCount).then(structure => {
        // Show bracket preview with seeding option, passing both counts
        displayFinalsBracketSetupPopup(tournament, groupName, activePlayers, structure, originalPlayerCount);
    }).catch(error => {
        console.error('Error loading finals structure:', error);
        alert('Feil ved lasting av bracket struktur');
    });
}

/**
 * Assign players with seeding to avoid same-pool matchups in first round
 * @param {Array} players - Array of player objects
 * @param {Object} structure - Finals structure object
 * @param {Object} roundStructure - Specific round structure to use
 * @returns {Array} - Array of assigned players
 */
export function assignPlayersWithSeeding(players, structure, roundStructure = null) {
    const assigned = [];
    
    // Use provided round structure or default to first round
    const targetRound = roundStructure || structure.rounds[0];
    
    // Count how many walkover positions we have
    const walkoverCourts = targetRound.courts.filter(court => 
        court.court === 'WO1' || court.court.toString().startsWith('WO')
    );
    const totalWalkovers = walkoverCourts.length;
    
    // Get the sorted players (top-ranked first)
    const sortedPlayers = sortPlayers(players);
    
    // Assign top-ranked players to walkover positions first
    const walkoverPlayers = [];
    for (let i = 0; i < totalWalkovers && i < sortedPlayers.length; i++) {
        walkoverPlayers.push(sortedPlayers[i]);
    }    // Remove walkover players from the remaining players for pool creation
    const remainingPlayers = sortedPlayers.slice(totalWalkovers);
    const pools = createSeedingPools(remainingPlayers, structure, targetRound);

    // Shuffle each pool after pools are created, before assignment
    for (let i = 0; i < pools.length; i++) {
        shuffleArray(pools[i]);
    }
    
    // Now assign players to courts in the correct order
    let walkoverIndex = 0;
    let poolIndex = 0;
    
    for (const court of targetRound.courts) {
        if (court.court === 'WO1' || court.court.toString().startsWith('WO')) {
            // Assign top-ranked player to walkover position
            if (walkoverIndex < walkoverPlayers.length) {
                assigned.push(walkoverPlayers[walkoverIndex]);
                walkoverIndex++;
            }
        } else {            // Regular court - assign players from different pools if possible
            for (let i = 0; i < court.players; i++) {
                let assignedPlayer = null;
                
                // Try to assign from different pools in round-robin fashion
                for (let attempt = 0; attempt < pools.length; attempt++) {
                    const currentPoolIndex = (poolIndex + attempt) % pools.length;
                    const poolPlayerIndex = Math.floor(assigned.filter(p => !walkoverPlayers.includes(p)).length / pools.length);
                    
                    if (pools[currentPoolIndex].length > poolPlayerIndex) {
                        assignedPlayer = pools[currentPoolIndex][poolPlayerIndex];
                        break;
                    }
                }
                
                // If we couldn't find a player from different pools, assign sequentially
                if (!assignedPlayer) {
                    for (const pool of pools) {
                        for (const player of pool) {
                            if (!assigned.includes(player)) {
                                assignedPlayer = player;
                                break;
                            }
                        }
                        if (assignedPlayer) break;
                    }
                }
                
                if (assignedPlayer) {
                    assigned.push(assignedPlayer);
                }
                
                poolIndex = (poolIndex + 1) % pools.length;
            }
        }
    }
    
    return assigned;
}

/**
 * Assign players without seeding but with proper walkover handling
 * @param {Array} players - Array of player objects
 * @param {Object} structure - Finals structure object
 * @param {Object} roundStructure - Specific round structure to use
 * @returns {Array} - Array of assigned players
 */
export function assignPlayersWithoutSeeding(players, structure, roundStructure = null) {
    // Use provided round structure or default to first round
    const targetRound = roundStructure || structure.rounds[0];
    const walkoverCourts = targetRound.courts.filter(court =>
        court.court === 'WO1' || court.court.toString().startsWith('WO')
    );
    const totalWalkovers = walkoverCourts.length;
    const sortedPlayers = sortPlayers(players);

    let walkoverPlayers = [];
    let randomizedPlayers = [];
    if (totalWalkovers > 0) {
        walkoverPlayers = sortedPlayers.slice(0, totalWalkovers);
        randomizedPlayers = sortedPlayers.slice(totalWalkovers).slice().sort(() => Math.random() - 0.5);
    } else {
        randomizedPlayers = sortedPlayers.slice().sort(() => Math.random() - 0.5);
    }

    const assigned = [];
    let walkoverIndex = 0;
    let randomizedIndex = 0;

    for (const court of targetRound.courts) {
        if (court.court === 'WO1' || court.court.toString().startsWith('WO')) {
            if (walkoverIndex < walkoverPlayers.length) {
                assigned.push(walkoverPlayers[walkoverIndex]);
                walkoverIndex++;
            }
        } else {
            for (let i = 0; i < court.players; i++) {
                if (randomizedIndex < randomizedPlayers.length) {
                    assigned.push(randomizedPlayers[randomizedIndex]);
                    randomizedIndex++;
                }
            }
        }
    }

    return assigned;
}

/**
 * Get the next round number for finals in a specific group
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name (A, B, etc.)
 * @returns {number} - Next round number
 */
export function getNextFinalsRoundNumber(tournament, groupName) {
    let maxRound = 0;
    
    // Check court assignments
    if (tournament.finalsCourtAssignments) {
        tournament.finalsCourtAssignments.forEach(round => {
            if (round.groupName === groupName && round.roundNumber > maxRound) {
                maxRound = round.roundNumber;
            }
        });
    }
    
    return maxRound + 1;
}

/**
 * Check if a structure uses 3-player courts
 * @param {Object} structure - Finals structure object
 * @returns {boolean} - True if structure has 3-player courts
 */
export function hasThreePlayerCourts(structure) {
    const firstRound = structure.rounds[0];
    return firstRound.courts && firstRound.courts.some(court => court.players === 3);
}


/**
/**
 * Create court assignments for any round (2-player or 3-player courts)
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name
 * @param {Array} players - Array of players
 * @param {Object} structure - Finals structure
 * @param {boolean} useSeeding - Whether to use seeding
 * @param {number} originalPlayerCount - Original number of players in group (for structure consistency)
 * @returns {Object} - Result object with success status and data
 */
export async function createCourtAssignments(tournament, groupName, players, structure, useSeeding, originalPlayerCount) {
    try {
        const sortedPlayers = sortPlayers(players);
        if (!tournament.finalsCourtAssignments) {
            tournament.finalsCourtAssignments = [];
        }
        const currentRoundNumber = getNextFinalsRoundNumber(tournament, groupName);
        const roundIndex = currentRoundNumber - 1;
        const roundStructure = structure.rounds[roundIndex] || structure.rounds[0];
        let assignedPlayers;
        if (useSeeding) {
            assignedPlayers = assignPlayersWithSeeding(sortedPlayers, structure, roundStructure);
        } else {
            assignedPlayers = assignPlayersWithoutSeeding(sortedPlayers, structure, roundStructure);
        }
        const courtAssignments = [];
        let playerIndex = 0;
        let courtNumber = 1;
        for (const court of roundStructure.courts) {
            if (court.court.toString().startsWith('WO')) {
                if (playerIndex < assignedPlayers.length) {
                    const walkoverPlayer = assignedPlayers[playerIndex];
                    courtAssignments.push({
                        courtNumber: `WO-${courtNumber}`,
                        players: [walkoverPlayer],
                        playersToAdvance: court.advance,
                        isWalkover: true,
                        isCompleted: false,
                        advancedPlayers: []
                    });
                    playerIndex++;
                }
            } else {
                // Handles both 2-player and 3-player courts
                const courtPlayers = [];
                for (let i = 0; i < court.players && playerIndex < assignedPlayers.length; i++) {
                    courtPlayers.push(assignedPlayers[playerIndex]);
                    playerIndex++;
                }
                if (courtPlayers.length > 0) {
                    courtAssignments.push({
                        courtNumber: courtNumber,
                        players: courtPlayers,
                        playersToAdvance: court.advance,
                        isWalkover: false,
                        isCompleted: false,
                        advancedPlayers: []
                    });
                    courtNumber++;
                }
            }
        }
        const roundNumber = getNextFinalsRoundNumber(tournament, groupName);
        const finalsRound = {
            roundNumber: roundNumber,
            courtAssignments: courtAssignments,
            groupName: groupName,
            roundName: roundStructure.name || `Round ${roundNumber} - Group ${groupName}`,
            isThreePlayerRound: roundStructure.courts.some(c => c.players === 3)
        };
        tournament.finalsCourtAssignments.push(finalsRound);
        tournament.saveToLocalStorage();
        return {
            success: true,
            assignments: courtAssignments.length,
            round: finalsRound
        };
    } catch (error) {
        console.error('Error creating court assignments:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
/**
 * Main function to create finals court assignments (2- or 3-player courts)
 * @param {Object} tournament - Tournament object
 * @param {string} groupName - Group name
 * @param {Array} players - Array of players
 * @param {Object} structure - Finals structure
 * @param {boolean} useSeeding - Whether to use seeding
 * @param {number} originalPlayerCount - Original number of players in group (for structure consistency)
 * @returns {Object} - Result object
 */
export async function createFinalsMatches(tournament, groupName, players, structure, useSeeding, originalPlayerCount) {
    console.log(`Creating finals for group ${groupName}`, { 
        players: players.length, 
        originalPlayerCount, 
        structure, 
        useSeeding 
    });
    // Always use court assignments for all rounds (2- or 3-player courts)
    return await createCourtAssignments(tournament, groupName, players, structure, useSeeding, originalPlayerCount);
}

/**
 * Update player advancement for 3-player court
 * @param {Object} tournament - Tournament object
 * @param {Object} assignment - Court assignment object
 * @param {Array} selectedPlayers - Array of selected players
 * @returns {boolean} - Success status
 */
export function updatePlayerAdvancement(tournament, assignment, selectedPlayers) {
    try {
        if (selectedPlayers.length !== assignment.playersToAdvance) {
            throw new Error(`Expected ${assignment.playersToAdvance} players, got ${selectedPlayers.length}`);
        }
        
        assignment.advancedPlayers = [...selectedPlayers];
        assignment.isCompleted = true;
        tournament.saveToLocalStorage();
        
        return true;
    } catch (error) {
        console.error('Error updating player advancement:', error);
        return false;
    }
}


