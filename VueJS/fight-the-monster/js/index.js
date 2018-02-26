new Vue({
  el: '#app',
  data: {
    gameStarted: false,
    whosTurn: 'player',
    winner: '',
    critChance: 25,
    healAmount: { low: 10, high: 25 },
    attackRanges: {
      normalAttack: { low: 1, high: 10 },
      specialAttack: { low: 7, high: 20}
    },
    player: {
      hitpoints: 100,
      specialAttackCharges: 2
    },
    monster: {
      hitpoints: 100,
      chatter: '',
      specialAttackCharges: 2,
      possibleActions: ["normalAttack", "specialAttack", "heal"]
    },
    attackLog: []
  },
  watch: {
    playerHp: function() {
      return this.player.hitpoints;
    },
    monsterHp: function() {
      return this.monster.hitpoints;
    },
    whosTurn: function() {
      if ( this.isMonstersTurn && this.gameStarted ){
        var vm = this;
        vm.monster.chatter =  "The monster is pondering it's next move..";
        setTimeout(function() {
          // get random monster action
          var monsterAction = vm.randomMonsterAction();
          // don't try to heal if already at full hp you silly monster!

          // find a random action that fits our criteria
          while (
            ( monsterAction === 'heal' && vm.monster.hitpoints == 100 ) ||
            ( monsterAction === 'specialAttack' && !vm.monsterCanPerformSpecial )
           ) {
            monsterAction = vm.randomMonsterAction();
          }

          // pew, pew!!
          if ( monsterAction === 'heal' ){
            vm.heal();
          } else {
            vm.attack(monsterAction, 'monster');
          }
          vm.monster.chatter =  '';
        },400);
      }
    },
    gameOver: function() {
      if ( this.gameOver ) {
        var gameWinner = this.player.hitpoints <= 0 ? 'monster' : 'player';
        this.stopGame(gameWinner);
      }
    }
  },
  computed: {
    healAmountRange: function() {
      return 'Heal for a random value between ' + this.healAmount.low + ' and ' + this.healAmount.high +
              '\nThis action cannot crit.';
    },
    specialAttackRange: function(){
      return 'Hit the opponent with a special attack for a random value between ' + this.attackRanges.specialAttack.low + ' and ' + this.attackRanges.specialAttack.high +
              '\nThis attack can crit for 2x damage!';
    },
    normalAttackRange: function(){
      return 'Hit the opponent with an attack for a random value between ' + this.attackRanges.normalAttack.low + ' and ' + this.attackRanges.normalAttack.high +
              '\nThis attack can crit for 2x damage!';
    },
    gameWinner: function() {
      return this.winner + ' wins this round!';
    },
    gameOver: function() {
      return ( this.player.hitpoints <= 0 || this.monster.hitpoints <= 0 );
    },
    isPlayersTurn: function() {
      return this.whosTurn == 'player';
    },
    isMonstersTurn: function() {
      return this.whosTurn == 'monster';
    },
    playerCanPerformSpecial: function() {
      return this.player.specialAttackCharges != 0;
    },
    monsterCanPerformSpecial: function() {
      return this.monster.specialAttackCharges != 0;
    },
    playerHp: function() {
      return this.player.hitpoints;
    },
    monsterHp: function() {
      return this.monster.hitpoints;
    }
  },
  methods: {
    randomMonsterAction: function() {
      var monsterActions = this.monster.possibleActions;
      var chosenMonsterAction = monsterActions[Math.floor(Math.random() * monsterActions.length)];
      return chosenMonsterAction;
    },
    startGame: function() {
      this.gameStarted = true;
      this.attackLog = [];
    },
    stopGame: function(gameWinner) {
      this.gameStarted = false;

      // reset player values
      this.player.hitpoints = 100;
      this.player.specialAttackCharges = 2;

      // reset monster values
      this.monster.hitpoints = 100;
      this.monster.specialAttackCharges = 2;

      this.winner = gameWinner;
    },
    heal: function() {
      var min = this.healAmount.low;
      var max = this.healAmount.high;

      // calculate random heal ammount based on min/max heal values
      var actualHealAmount = Math.round(Math.random() * (max - min) + min);

      var currentHP = this.getCurrentPlayerObject().hitpoints + actualHealAmount;

      var overHeal = null;
      if ( currentHP > 100 ) {  overHeal = currentHP - 100; currentHP = 100; }

      this.logAction('heal', this.whosTurn, (actualHealAmount - overHeal) || actualHealAmount);
      this.getCurrentPlayerObject().hitpoints = currentHP;
      this.toggleTurn();
    },
    attack: function(attackType, attacker) {
      var attackDamage = this.getAttackDamage(attackType)
      var attackedObj = attacker === 'player' ? this.monster : this.player;

      this.logAction('attack', attacker, attackDamage.totalDamage, attackDamage.crit, attackDamage.attackType);
      this.addSpecialCharge(attackType, this.getCurrentPlayerObject());
      attackedObj.hitpoints -= attackDamage.totalDamage;
      this.toggleTurn();
    },
    addSpecialCharge: function(attackType, playerObj) {
      if ( playerObj.specialAttackCharges < 2 && attackType !== 'specialAttack') { playerObj.specialAttackCharges++; }
    },
    logAction: function(action, player, actionValue, crit, attackType) {
      var attacker = player;
      if ( action === 'attack'){
        var attacked = player === 'player' ? 'monster' : 'player'

        var message = attacker + " hits " + attacked + " for " + actionValue;
        if ( attackType === 'specialAttack' ) { message += " ( special! ) "; }
        if ( crit ) { message += " ( crit! )"; }
      } else {
        var message = attacker + " heals himself for " + actionValue;
      }

      this.attackLog.unshift({ message: message, player: attacker});

    },
    toggleTurn: function() {
      if ( this.gameStarted && !this.gameOver ){
        this.whosTurn = this.whosTurn === 'player' ? 'monster' : 'player';
      }
    },
    getAttackDamage: function(attackType) {
      var currentPlayer = this.getCurrentPlayerObject();
      // deduct charges from players specialAttackCharges if attack of type 'specialAttack' is performed
      if ( attackType == 'specialAttack') { currentPlayer.specialAttackCharges--; }

      // get min, max attack ranges
      var min = this.attackRanges[attackType].low;
      var max = this.attackRanges[attackType].high;

      // did the attack crit?
      var crit = Math.round(Math.random() * (100 - 1) + 1) <= this.critChance;

      // base attack damage(witout crit)
      var attackDamage = Math.round(Math.random() * (max - min) + min);

      // total attack damage(with crit => attackDamage*2)
      var totalDamage = crit ? attackDamage * 2 : attackDamage;
      return { baseDamage: attackDamage, totalDamage: totalDamage, crit: crit, attackType: attackType }
    },
    getCurrentPlayerObject: function() {
      if ( this.whosTurn == 'player'){
        return this.player;
      } else {
        return this.monster;
      }
    }
  }
})
