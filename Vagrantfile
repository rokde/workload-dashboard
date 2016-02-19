# -*- mode: ruby -*-
# vi: set ft=ruby :

module OS
    def OS.windows?
        (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil
    end

    def OS.mac?
        (/darwin/ =~ RUBY_PLATFORM) != nil
    end

    def OS.unix?
        !OS.windows?
    end

    def OS.linux?
        OS.unix? and not OS.mac?
    end
end


Vagrant.configure("2") do |config|

    config.vm.box = "scotch/box"
    config.vm.network "private_network", ip: "192.168.33.11"
    config.vm.hostname = "scotchbox"

	# if a VPN connection is active on the host system, direct routing might fail,
	# so we redirect, ie. 127.0.0.1:8090 => 192.168.33.10:80
	config.vm.network "forwarded_port", guest: 80, host: 8090, protocol: "tcp"

    if OS.windows? then
        config.vm.synced_folder ".", "/var/www", :nfs => { :mount_options => ["dmode=777","fmode=777"], :create => true, :owner => 'vagrant', :group => 'vagrant' }
    else
	    config.vm.synced_folder ".", "/var/www", :mount_options => ["dmode=777", "fmode=666"]
    end

	config.vm.provider :virtualbox do |vb|
		vb.name = "scotchbox"
		vb.customize ["modifyvm", :id, "--memory", "1024"]
		vb.customize ["guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-threshold", 10000]
		vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/var/www", "1"]
	end

end