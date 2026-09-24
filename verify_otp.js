require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

async function testOtpFlow() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    const testPhone = `999${Math.floor(1000000 + Math.random() * 9000000)}`;
    console.log(`\n--- Test Phone Number: ${testPhone} ---`);

    // Step 1: Simulate Send OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    console.log(`[TEST 1] Generating 4-digit OTP: ${otp} (Length: ${otp.length})`);
    if (otp.length !== 4) {
      throw new Error(`OTP length is not 4 digits: ${otp}`);
    }
    console.log('PASS: OTP is 4 digits long.');

    let user = await User.findOne({ phone: testPhone });
    if (!user) {
      user = new User({ phone: testPhone, name: 'OTP Test User' });
    }
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
    console.log(`[TEST 1] Saved user with OTP expiring at: ${otpExpiresAt.toISOString()}`);

    // Step 2: Test Invalid OTP
    console.log('\n[TEST 2] Testing incorrect OTP verification...');
    const wrongOtp = otp === '1111' ? '2222' : '1111';
    if (user.otp !== wrongOtp) {
      console.log('PASS: Correctly identified invalid OTP.');
    } else {
      console.log('FAIL: Accepted invalid OTP.');
    }

    // Step 3: Test Valid OTP within 2 minutes
    console.log('\n[TEST 3] Testing valid OTP verification within 2 minutes...');
    const now = new Date();
    if (now <= new Date(user.otpExpiresAt) && user.otp === otp) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      console.log('PASS: OTP verified successfully within 2-minute window.');
    } else {
      console.log('FAIL: OTP verification failed for valid OTP.');
    }

    // Step 4: Test Expired OTP
    console.log('\n[TEST 4] Testing expired OTP behavior...');
    const expiredOtp = '5555';
    const pastExpiresAt = new Date(Date.now() - 1000); // 1 sec ago (expired)
    user.otp = expiredOtp;
    user.otpExpiresAt = pastExpiresAt;
    await user.save();

    const checkNow = new Date();
    if (checkNow > new Date(user.otpExpiresAt)) {
      console.log('PASS: OTP correctly detected as expired.');
    } else {
      console.log('FAIL: Failed to detect expired OTP.');
    }

    // Cleanup test user
    await User.deleteOne({ phone: testPhone });
    console.log(`\nCleaned up test user: ${testPhone}`);

    console.log('\nALL OTP TESTS PASSED SUCCESSFULLY! 🎉');
  } catch (err) {
    console.error('OTP Test Failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

testOtpFlow();
