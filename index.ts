const dotenv = require("dotenv");
dotenv.config();
const { InlineProgramArgs, LocalWorkspace } = require("@pulumi/pulumi/automation");
const pulumi = require("@pulumi/pulumi");
const hcloud = require("@pulumi/hcloud");
const tls = require("@pulumi/tls");

(async () => {
  
  const pulumiProgram = async () => {
    const defaultKey = new tls.PrivateKey("default", {
      algorithm: "ED25519",
    })

    const hcloud_sshKey = new hcloud.SshKey("hcloud-ssh-key", {
      publicKey: defaultKey.publicKeyOpenssh,
      name: "test-key-" + pulumi.getStack(),
    })

    const hcloud_server = new hcloud.Server("test-server", {
      name: "test-server--" + pulumi.getStack(),
      location: "nbg1",
      serverType: "cax11",
      image: "ubuntu-20.04",
      sshKeys: [hcloud_sshKey.id],
    })

    return {
      server_ip: hcloud_server.ipv4Address,
    }
  }

  const args = {
    stackName: "dev",
    projectName: "hetzner_server_test",
    program: pulumiProgram,
   
  };

  const stack = await LocalWorkspace.createOrSelectStack(args, {
    projectSettings: {
      name: "hetzner_server_test",
      runtime: "nodejs",
      backend: {
        url: "s3://pulumi?region=uk&endpoint=https://api.s3.lab.soxprox.com&s3ForcePathStyle=true" 
      }
    }
  });

  const upRes = await stack.destroy({ onOutput: console.info });
  console.log("upRes: ", upRes);

})()

