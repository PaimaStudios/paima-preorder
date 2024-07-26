import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('PaimaLaunchpad', m => {
  const owner = m.getAccount(0);
  const launchpadImpl = m.contract('PaimaLaunchpad', [], { id: 'PaimaLaunchpad_implementation' });

  const factory = m.contract('PaimaLaunchpadFactory', [launchpadImpl, owner], {
    id: 'PaimaLaunchpad_factory',
  });

  const launchpadDeploy1 = m.call(factory, 'deploy', [owner, 500n, []], { id: 'Deploy1' });
  const launchpad1Address = m.readEventArgument(
    launchpadDeploy1,
    'LaunchpadDeployed',
    'launchpad',
    {
      id: 'address1',
    }
  );
  const launchpad1 = m.contractAt('PaimaLaunchpad', launchpad1Address, { id: 'PaimaLaunchpad_1' });

  const launchpadDeploy2 = m.call(factory, 'deploy', [owner, 500n, []], { id: 'Deploy2' });
  const launchpad2Address = m.readEventArgument(
    launchpadDeploy2,
    'LaunchpadDeployed',
    'launchpad',
    {
      id: 'address2',
    }
  );
  const launchpad2 = m.contractAt('PaimaLaunchpad', launchpad2Address, { id: 'PaimaLaunchpad_2' });

  return { factory, launchpad1, launchpad2 };
});
