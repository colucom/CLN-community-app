const defer = require('config/defer').deferConfig

module.exports = {
  api: {
    allowCors: true,
    secret: 'secret',
    tokenExpiresIn: '7d',
    port: 3000,
    auth: {
      domain: {
        name: 'CLN Communities Dev',
        chainId: defer(function () {
          return this.web3.network === 'mainnet' ? 1 : 3
        }),
        version: 1
      }
    }
  },
  aws: {
    secrets: {
      manager: {
        region: 'eu-west-1'
      }
    }
  },
  ipfsProxy: {
    urlBase: 'http://localhost:4000/api'
  },
  network: {
    misc: {
      pageSize: 1000
    },
    home: {
      name: 'fuse',
      bridgeType: 'home',
      provider: 'http://rpc.fuse.io',
      addressesMainnet: {
        HomeBridgeFactory: '0x93EF4d4032E053978aA71792Efd05d8b583a2B78',
        SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
        BridgeMapper: '0x41063a48F46EE7E20E7EbAd0185992724B4Ee56c'
      },
      addressesRopsten: {
        HomeBridgeFactory: '0xc40c690AaB6c218cbEd4d55970020fDF3a0210cC',
        SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
        BridgeMapper: '0xE92139Ae1d18Febf8cB68fF5D39Cd2c235677070',
        UsersRegistry: '0xD54C1B417502CDe8275cBf91B0A8dC820ccb8054'
      },
      addresses: defer(function () {
        if (this.network.foreign.name === 'mainnet') {
          return this.network.home.addressesMainnet
        } else {
          return this.network.home.addressesRopsten
        }
      })
    },
    foreign: {
      name: 'ropsten',
      bridgeType: 'foreign',
      provider: defer(function () {
        return `https://${this.network.foreign.name}.infura.io/v3/${this.web3.apiKey}`
      }),
      addresses: {
        ropsten: {
          ColuLocalNetwork: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
          TokenFactory: '0xE307a14b078030d81801e46F89285dbf5B4aa3F0',
          ForeignBridgeFactory: '0x98C876777F03961e81fB3F1793a4fE03f1efeD54'
        },
        mainnet: {
          ColuLocalNetwork: '0x4162178B78D6985480A308B2190EE5517460406D',
          TokenFactory: '0xac051e086FD2046FC75A53D38088B4DD6e00E25b',
          ForeignBridgeFactory: '0xE600496e0267D6b7AFDb62f83D46062199f0B0d7'
        }
      },
      gasStation: 'https://gasprice.poa.network/'
    }
  },
  web3: {
    homeNetwork: 'fuse',
    foreignNetwork: 'ropsten',
    provider: defer(function () {
      return `https://${this.web3.network}.infura.io/v3/${this.web3.apiKey}`
    }),
    websocketProvider: defer(function () {
      return `wss://${this.web3.network}.infura.io/ws/v3/${this.web3.apiKey}`
    }),
    gasStation: 'https://gasprice.poa.network/',
    fuseProvider: 'http://rpc.fuse.io',
    network: 'ropsten',
    pageSize: 1000,
    addresses: {
      ropsten: {
        ColuLocalNetwork: '0x41C9d91E96b933b74ae21bCBb617369CBE022530',
        TokenFactory: '0xE307a14b078030d81801e46F89285dbf5B4aa3F0',
        ForeignBridgeFactory: '0x98C876777F03961e81fB3F1793a4fE03f1efeD54'
      },
      mainnet: {
        ColuLocalNetwork: '0x4162178B78D6985480A308B2190EE5517460406D',
        TokenFactory: '0xac051e086FD2046FC75A53D38088B4DD6e00E25b',
        ForeignBridgeFactory: '0xE600496e0267D6b7AFDb62f83D46062199f0B0d7'
      },
      fuse: defer(function () {
        if (this.web3.network === 'mainnet') {
          return {
            HomeBridgeFactory: '0x93EF4d4032E053978aA71792Efd05d8b583a2B78',
            SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
            BridgeMapper: '0x41063a48F46EE7E20E7EbAd0185992724B4Ee56c'
          }
        } else {
          return {
            HomeBridgeFactory: '0xc40c690AaB6c218cbEd4d55970020fDF3a0210cC',
            SimpleListFactory: '0x9FA04c6fc70B0ae20dAD9D7b36161bf1EdcbA0E2',
            BridgeMapper: '0xE92139Ae1d18Febf8cB68fF5D39Cd2c235677070',
            UsersRegistry: '0xD54C1B417502CDe8275cBf91B0A8dC820ccb8054'
          }
        }
      })
    }
  },
  mongo: {
    uri: 'mongodb://localhost/CLN-community-app',
    debug: true,
    options: {}
  },
  mail: {
    sendgrid: {
      templates: {}
    }
  },
  explorer: {
    fuse: {
      urlBase: 'https://explorer.fuse.io/api'
    }
  },
  agenda: {
    start: true
  }
}
