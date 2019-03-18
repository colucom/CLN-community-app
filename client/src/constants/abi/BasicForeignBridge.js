module.exports = [
  {
    'constant': true,
    'inputs': [],
    'name': 'requiredSignatures',
    'outputs': [
      {
        'name': '',
        'type': 'uint256'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [],
    'name': 'validatorContract',
    'outputs': [
      {
        'name': '',
        'type': 'address'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'name': 'recipient',
        'type': 'address'
      },
      {
        'indexed': false,
        'name': 'value',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'name': 'transactionHash',
        'type': 'bytes32'
      }
    ],
    'name': 'RelayedMessage',
    'type': 'event'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'vs',
        'type': 'uint8[]'
      },
      {
        'name': 'rs',
        'type': 'bytes32[]'
      },
      {
        'name': 'ss',
        'type': 'bytes32[]'
      },
      {
        'name': 'message',
        'type': 'bytes'
      }
    ],
    'name': 'executeSignatures',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': '_txHash',
        'type': 'bytes32'
      }
    ],
    'name': 'relayedMessages',
    'outputs': [
      {
        'name': '',
        'type': 'bool'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  }
]
